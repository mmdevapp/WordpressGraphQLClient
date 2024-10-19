# WordpressGraphQLClient

The `WordpressGraphQLClient` class is a utility for fetching and managing WordPress data using GraphQL. It leverages Apollo Client to perform queries and manage data caching. This README provides an overview of the class and its methods.

## Installation

Ensure you have the necessary dependencies installed:

```bash
npm install @apollo/client graphql
```

## Usage

### Importing

To use the `WordpressGraphQLClient` class, import it along with the required dependencies:

```javascript
import { WordpressGraphQLClient } from './path/to/WordpressGraphQLClient';
```

### Initialization

Create an instance of `WordpressGraphQLClient`:

```javascript
const wpClient = new WordpressGraphQLClient();
```

### Methods

#### `fetchNodeByUri(uri: string)`

Fetches a WordPress node by its URI. This method determines the type of node and fetches the appropriate data.

```javascript
wpClient.fetchNodeByUri('/sample-page').then(page => {
    console.log(page);
});
```

#### `registerGutenbergBlock(blockName: string, fields: RecursiveGraphQLStructure)`

Registers a Gutenberg block with specified fields to be included in the GraphQL queries. Here's an example of registering a gallery block:

```javascript
const galleryBlockFields = {
    blockname: 'AcfGallery',
    blockContent: [
        {
            attributes: [
                'className',
            ],
            gallery: [
                'headline',
                {
                    photos: [
                        {
                            thumbnail: {
                                node: [
                                    'altText',
                                    'mediaItemUrl',
                                    {
                                        mediaDetails: [
                                            'height',
                                            'width',
                                        ],
                                    },
                                ],
                            },
                        },
                        {
                            picture: {
                                node: [
                                    'altText',
                                    'mediaItemUrl',
                                    {
                                        mediaDetails: [
                                            'height',
                                            'width',
                                        ],
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        } as RecursiveGraphQLStructure,
    ],
};

wpClient.registerGutenbergBlock(galleryBlockFields.blockname, galleryBlockFields.blockContent);
```

#### `fetchPageById(id: string)`

Fetches a WordPress page by its ID, including registered Gutenberg blocks.

```javascript
wpClient.fetchPageById('123').then(page => {
    console.log(page);
});
```

### Private Methods

- `getIdAndTypeByUri(uri: string)`: Retrieves the ID and type of a node by its URI.
- `activateGutenbergBlocks(query: GraphQLQueryBuilder)`: Activates registered Gutenberg blocks for a query.
- `runGraphQlQuery(query: string, variables?: Record<string, any>)`: Executes a GraphQL query using Apollo Client.

## Dependencies

- `@apollo/client`: For managing GraphQL queries and caching.
- `graphql`: Required for parsing GraphQL queries.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

## Author

Martin Michel  

---
