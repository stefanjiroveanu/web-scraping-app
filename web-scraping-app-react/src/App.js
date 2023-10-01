import { useEffect, useState } from "react";
import Slides from "./components/slide";
import LoadingSpinner from "./components/spinner";
import { ToastContainer } from "react-toastify";

export default function App() {
  const [data, setData] = useState(null);
  const [url, setUrl] = useState("");
  const [link, setLink] = useState(false);
  const [image, setImage] = useState(false);
  const [feelings, setFeelings] = useState("");
  const [spinner, setSpinner] = useState(false);

  const getSlides = () => {
    let analysis;
    if (feelings === "Simple Algorithm") {
      analysis = "simple";
    } else if (feelings === "Machine Learning Algorithm") {
      analysis = "ml";
    }
    const requestUrl = `http://127.0.0.1:18080/scrape?url=${url}&links=${link}&img=${image}&analysis=${analysis}`;

    const requestData = fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.status}`);
        }
        setSpinner(false);
        return res.json();
      })
      .catch((error) => {
        setSpinner(false);
        console.error("Error fetching data:", error);
        alert(error.message);
      });

    return requestData;
  };

  useEffect(() => {
    const keyDownHandler = (event) => {
      console.log("User pressed: ", event.key);

      if (event.key === "Enter") {
        console.log(link, JSON.stringify(url), feelings, image);
        handleSubmit();
      }

      if (event.key === "Control") {
        console.log(link, JSON.stringify(url), feelings, image);
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  });

  const handleSubmit = async () => {
    setSpinner(true);
    const slideData = await getSlides();
    setData(slideData);
  };

  return (
    <main className="bg-primary py-20 px-20 w-full h-screen flex-grow">
      <div className="w-auto h-auto bg-secondary flex-shrink-0 rounded-3xl shadow">
        <h2 className="text-white text-6xl text-center pt-20 pb-10 leading-normal">
          WEB SCRAPING APP
        </h2>
        <input
          className="input flex flex-none mx-auto image focus:outline-none text-white"
          placeholder="Input an URL"
          onChange={(event) => {
            setUrl(event.target.value);
          }}
        />
        <form className="inline-block text-center pb-20 pl-[35rem] w-auto">
          <div className="float-left">
            <div className=" w-10 h-10 text-white">Link</div>
            <input
              type="checkbox"
              className="bg-secondary float-left w-10 h-10 border-solid border-2 border-white rounded-full text-white mr-40"
              onClick={() => {
                console.log(!link);
                setLink(!link);
              }}
            ></input>
          </div>
          <div className="float-left">
            <div className=" w-10 h-10 text-white">Image</div>
            <input
              type="checkbox"
              className="bg-secondary float-left w-10 h-10 border-solid border-2 border-white rounded-full text-white mr-20"
              onClick={() => {
                console.log(!image);
                setImage(!image);
              }}
            ></input>
          </div>
          <select
            onChange={(event) => {
              console.log(event.target.value);
              setFeelings(event.target.value);
            }}
            className="mt-8 w-96 h-12 flex float-left text-center bg-secondary focus:outline-none text-white border-solid border-2 border-white rounded-full"
          >
            <option>None</option>
            <option>Simple Algorithm</option>
            <option>Machine Learning Algorithm</option>
          </select>
          {spinner && <LoadingSpinner />}
        </form>
        <div className="h-80 pl-10 my-auto inline-block text-center flex">
          <Slides data={data}></Slides>
          <ToastContainer
            position="top-right"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            draggable
            theme="light"
          />
        </div>
        {data && (
          <a
            className="h-10 w-40 mx-[50rem] mb-5 bg-white hover:bg-gray-200 text-center text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            type="button"
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(data, null, 2)
            )}`}
            download="scraped.json"
          >
            {`Download`}
          </a>
        )}
      </div>
    </main>
  );
}
