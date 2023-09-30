const Slides = ({ data }) => {
  if (data) {
    console.log(data);
    return (
      data != null &&
      data.map((entry) => {
          return (
            <div
              key={entry.jsonPageNumber}
              className="text-left bg-white shadow rounded-xl h-64 w-96 float-left mr-10 transition duration-500 hover:scale-110 overflow-scroll"
            >
              <pre>{JSON.stringify(entry, null, 2)}</pre>
            </div>
          );
      })
    );
  }
};


export default Slides;
