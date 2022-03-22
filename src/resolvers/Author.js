import Book from './Book';

const resolvers = {
  Author: {
    books: Book.Query.books,
  },
  Query: {
    authors: () => {
      return [
        {
          name: 'Patrick Rothfuss',
        },
      ];
    },
  },
};

export default resolvers;
