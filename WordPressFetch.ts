import { apolloClient, apolloClientNoCache } from "../apollo";
import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import { GraphQLQueryBuilder, FragmentContent } from "./GraphQLQueryBuilder";
import { RecursiveGraphQLStructure } from "./GraphQLQueryBuilder"
export class WordPressFetch {
    client: ApolloClient<NormalizedCacheObject>
    pageFields: (string | Record<string, any>)[]
    editorBlocks: FragmentContent[] // Update the type here
    constructor() {
        this.client = apolloClient;
        this.pageFields = ['id', { editorBlocks: ['...pageBlocks'] }];
        this.editorBlocks = [];
    }

    public async fetchNodeByUri(uri: string) {
        const NodeBasics = await this.getIdAndTypeByUri(uri).then(data => data);
        switch (NodeBasics.data.nodeByUri.__typename) {
            case 'Page':
                const page = await this.fetchPageById(NodeBasics.data.nodeByUri.id).then(data => data);
                return page;
                break;
            default:
                return null;
        }
    }
    public registerGutenbergBlock(blockName: string, fields: RecursiveGraphQLStructure) {
        this.editorBlocks.push({ targetType: blockName, contentFields: fields });
        return this;
    }
    private async getIdAndTypeByUri(uri: string) {
        const fetchNodeByUriQuery = new GraphQLQueryBuilder('nodeByUri').select(['id', '__typename']).variables({ uri: uri }).buildQuery();
        const data = await this.runGraphQlQuery(fetchNodeByUriQuery, { uri: uri }).then((data => data));
        return data;
    }
    public async fetchPageById(id: string) {
        const queryBuilder = new GraphQLQueryBuilder('page');
        const pageData = this.activateGutenbergBlocks(queryBuilder).select(this.pageFields).variables({ id: id }).buildQuery();
        console.log(pageData);
        const data = await this.runGraphQlQuery(pageData, { id: id }).then((data => data));
        return data.data.page;
    }
    public activateGutenbergBlocks(query: GraphQLQueryBuilder) {
        let blockFragments: FragmentContent[] = [];
        this.editorBlocks.forEach(block => {
            blockFragments.push({ targetType: block.targetType, contentFields: block.contentFields });
        });
        query.fragments('pageBlocks', 'EditorBlock', blockFragments);
        return query;
    }
    private async runGraphQlQuery(query: string, variables?: Record<string, any>) {
        return await this.client.query({
            query: gql(query),
            variables: variables,
        }).then(data => data);
    }
}
