import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Slides = ({ data }) => {

  if (data) {
    console.log(data);
    return (
      data != null &&
      data.map((entry) => {
        const returnedData = JSON.stringify(entry, null, 2);
        return (
          <div
            key={entry.jsonPageNumber}
            className="text-left bg-white shadow rounded-xl h-64 w-96 float-left mr-10 transition duration-500 hover:scale-110 overflow-scroll"
            onClick={() => {
              navigator.clipboard.writeText(returnedData);
              toast("Text copied to clipboard");
            }}
          >
            <pre>{returnedData}</pre>
          </div>
        );
      })
    );
  }
};

export default Slides;
