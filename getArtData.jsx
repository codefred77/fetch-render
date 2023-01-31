const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("cats");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://api.artic.edu/api/v1/artworks/search?q=cats",
    {
      data: []
    }
  );

  return (
    <Fragment>
      <div className="app">
      <form className="form-inline"
        onSubmit={event => {
          doFetch(`https://api.artic.edu/api/v1/artworks/search?q=${query}`);

          event.preventDefault();
        }}
      >
        <div className="form-group">
          <label>Search artwork catalog:</label>
          <input 
            className="form-control mx-sm-3 mb-2" 
            id="searchField" 
            placeholder="Enter artwork search term"
            type="text" 
            value={query}
            onChange={event => setQuery(event.target.value)}
           />
        </div>
        <button type="submit" className="btn btn-primary mx-sm-3 mb-2">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul className="list-group">
          {data.data.map(item => (
            <li className="list-group-item" key={item.id}>
              "{item.title}" (ID: {item.id}) - {item.thumbnail.alt_text}
            </li>
          ))}
        </ul>
      )}
      
      </div>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
