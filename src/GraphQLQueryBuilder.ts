
interface QueryObject {
    operation: string;
    fields: (string | Record<string, any>)[];
    variables?: RecursiveGraphQLStructure;
    fragments?: ({ name: string, on: string, content: FragmentContent[] })[];
    options?: Record<string, any>;
}
export type RecursiveGraphQLStructure = (string | RecursiveGraphQLStructure[] | { [key: string]: RecursiveGraphQLStructure }) | RecursiveGraphQLStructure[];
export type WordPressID = string;
export interface FragmentContent {
    targetType: string;
    contentFields: RecursiveGraphQLStructure;
}

export class GraphQLQueryBuilder {
    private queryObject: QueryObject;

    constructor(operation: string) {
        this.queryObject = {
            operation,
            fields: [],
            variables: {},
            fragments: [],
            options: {}
        };
    }

    public select(fields: (string | Record<string, any>)[]): GraphQLQueryBuilder {
        this.queryObject.fields = fields;
        return this;
    }

    public where(options: Record<string, any>): GraphQLQueryBuilder {
        this.queryObject.options = { ...this.queryObject.options, ...options };
        return this;
    }

    public variables(variables: Record<string, any>): GraphQLQueryBuilder {
        this.queryObject.variables = { ...this.queryObject.variables, ...variables };
        return this;
    }

    public fragments(name: string, on: string, content: FragmentContent[]): GraphQLQueryBuilder {
        const fragment = { name: name, on: on, content: content };
        this.queryObject.fragments = this.queryObject.fragments?.concat(fragment);
        return this;
    }

    public buildQuery(): string {
        const { operation, fields, variables, fragments, options } = this.queryObject;
        const variablesString = this.buildVariablesString(variables);
        const fieldsString = this.buildFieldsString(fields);
        const optionsString = this.buildOptionsString(options);
        const fragmentsString = this.buildFragmentsString(fragments);
        if (variablesString != '' || optionsString != '') {
            return `query ${variablesString ? `(${variablesString})` : ''} {
                ${operation} ( ${optionsString} ${variablesString ? `${this.buildVariableAssignments(variables)}` : ''}) {
                  ${fieldsString}
                }
              }
              ${fragmentsString}`;
        } else {
            return `query ${variablesString} {
                ${operation}  {
                  ${fieldsString}
                }
              }
              ${fragmentsString}`;
        }

    }

    private buildVariablesString(variables?: Record<string, any>): string {
        if (!variables) return '';
        return `${Object.keys(variables)
            .map(key => {
                if (key === 'id') return `$${key}: ID!`
                return `$${key}: ${this.getGraphQLType(variables[key])}`
            })
            .join(', ')}`;
    }

    private buildVariableAssignments(variables?: Record<string, any>): string {
        if (!variables) return '';
        return Object.keys(variables)
            .map(key => `${key}: $${key}`)
            .join(', ');
    }

    public buildFieldsString(fields: RecursiveGraphQLStructure): string {
        return objectToString(fields);
    }

    private buildOptionsString(options?: Record<string, any>): string {
        if (!options) return '';

        return '' + Object.entries(options)
            .map(([key, value]) => {
                if (typeof value === 'object') {
                    const subOptions = Object.entries(value)
                        .map(([subKey, subValue]) => `${subKey}: ${JSON.stringify(subValue)}`)
                        .join(', ');
                    return `${key}: { ${subOptions} }`;
                }
                return `${key}: ${JSON.stringify(value)}`;
            })
            .join(', ') + '';
    }

    private buildFragmentsString(fragments: ({ name: string, on: string, content: FragmentContent[] })[] | undefined): string {
        if (!fragments) return '';
        const output = fragments.map((fragment) => `fragment ${fragment.name} on ${fragment.on} {
                ${fragment.content.map(fragmentContent => `... on ${fragmentContent.targetType} {
                    ${objectToString(fragmentContent.contentFields)}
                }`).join('\n')}
                }`)
            .join('\n')
        return output;
    }

    private getGraphQLType(value: any): string {
        switch (typeof value) {
            case 'string':
                return 'String!';
            case 'number':
                return Number.isInteger(value) ? 'Int' : 'Float';
            case 'boolean':
                return 'Boolean';
            default:
                return 'String'; // Default to String for simplicity
        }
    }
}

function objectToString(obj: RecursiveGraphQLStructure, indentLevel: number = 0): string {
    const indent = '  '.repeat(indentLevel);

    if (typeof obj === 'string') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => objectToString(item, indentLevel)).join('\n');
    }

    const entries = Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
            return `${indent}${key} {\n${objectToString(value, indentLevel + 1)}\n${indent}}`;
        } else {
            return `${indent}${key}`;
        }
    });

    return entries.join('\n');
}