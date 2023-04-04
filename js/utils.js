class NetworkError extends Error {
  constructor(msg, response) {
    super(msg);
    this.name = 'NetworkError';
    this.response = response;
    this.status = response.status;
    this.statusText = response.statusText;
  }
}

export { NetworkError };

/*
Sample usage of custom NetworkError

fetch(url)
  .then(response => {
    if( ! response.ok ) throw new NetworkError('Failed API Call', response);
    return response.json();
  })
  .then(data => {
    //you have the json data to use
  })
  .catch(err=>{
    //handle the error and tell the user
  });
*/