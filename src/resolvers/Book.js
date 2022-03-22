const resolvers = {
  Query: {
    books: () => {
      return [
        {
          title: 'The Name of the Wind',
          author: 'Patrick Rothfuss',
        },
        {
          title: "The Wise Man's Fear",
          author: 'Patrick Rothfuss',
        },
      ];
    },
  },
};

export default resolvers;
