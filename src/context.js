const context = (req, res, reqParams) => {
  let authToken = null;
  let currentUser = null;

  try {
    authToken = req.headers[HEADER_NAME];

    if (authToken) {
      currentUser = await tradeTokenForUser(authToken);
    }
  } catch (e) {
    console.warn(`Unable to authenticate using auth token: ${authToken}`);
  }

  return {
    authToken,
    currentUser,
  };
};

export default context;
