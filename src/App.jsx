import { useEffect, useRef, useState } from "react";
import "./App.css";
// import { createRoot } from "react-dom/client";
import * as facemesh from "@tensorflow-models/facemesh";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [showVerify, setShhowVerify] = useState(false);
  const [pictureCLicked, setPictureClicked] = useState(0);
  const [side, setSide] = useState("");
  const [topBottom, setTopBottom] = useState("");
  const [noFaceDetected, setNoFaceDetected] = useState(true);
  const [capturedPictures, setCapturedPictures] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    employeeID: "",
    phoneNumber: "",
    images: [],
  });

  // HANDLE INPUT FIELD DETAILS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // HANDLE COMAPNY SELECT OPTION DETAILS
  const handleSelectChange = (e) => {
    setFormData({
      ...formData,
      company: e.target.value,
    });
  };
  console.log(formData);

  // setInterval(() => {
  //     fetch(
  //         "http://localhost:5000/tfhub/tensorflow/tfjs-model/blazeface/1/default/1/model.json?tfjs-format=file",
  //         { mode: "no-cors" }
  //     )
  //         .then((response) => {
  //             runFacemesh();
  //         })
  //         .catch((error) => {
  //             console.error("Error fetching the resource:", error);
  //         });
  // }, 2000);

  // LOAD THE FACEMESH
  const runFacemesh = async () => {
    const net = await facemesh.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });
    setInterval(() => {
      detect(net);
    }, 500);
  };

  // DETECT THE FACE
  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // make detection
      const face = await net.estimateFaces(video);

      if (face.length > 0) {
        // Calculate face direction based on landmarks
        const landmarks = face[0].scaledMesh;
        6;

        // Calculate average positions of left and right eye
        const leftEye = landmarks[159]; // Example landmark for the left eye
        const rightEye = landmarks[386]; // Example landmark for the right eye

        const avgEyeX = (leftEye[0] + rightEye[0]) / 2;
        const avgEyeY = (leftEye[1] + rightEye[1]) / 2;

        // Calculate nose position
        const nose = landmarks[10]; // Example landmark for the nose
        const noseY = nose[1];

        // Calculate average positions of upper and bottom face
        const avgFaceY = (avgEyeY + noseY) / 2;

        // Define thresholds for sensitivity with adjusted values
        const leftThreshold = 0.6; // 65% of the video width
        const rightThreshold = 0.35; // 35% of the video width
        const upperThreshold = 0.3; // Adjusted value for reduced sensitivity
        const bottomThreshold = 0.6; // 50% of the video height

        // Check direction based on thresholds
        const isLookingLeft = avgEyeX < videoWidth * leftThreshold;
        const isLookingRight = avgEyeX > videoWidth * rightThreshold;
        const isLookingUp = avgFaceY < videoHeight * upperThreshold; // Check if looking up
        const isLookingDown = avgFaceY > videoHeight * bottomThreshold;

        // Calculate face direction based on eye and nose positions
        let horizontalDirection = "Front";
        setSide("Front");

        if (isLookingLeft && !isLookingRight) {
          horizontalDirection = "Left";
          setSide("Left");
        } else if (isLookingRight && !isLookingLeft) {
          horizontalDirection = "Right";
          setSide("Right");
        }

        let verticalDirection = "Front";
        setTopBottom("Front");
        if (isLookingUp) {
          verticalDirection = "Up";
          setTopBottom("Up");
        } else if (isLookingDown) {
          setTopBottom("Down");
          verticalDirection = "Down";
        }

        console.log(
          `SIDE: ${horizontalDirection}, TOP-BOTTOM: ${verticalDirection}`
        );
        // console.log(`SIDE: ${side}, TOP-BOTTOM: ${topBottom}`);
        setNoFaceDetected(false);
      } else {
        // No face detected
        console.log("No face detected");
      }
    }
  };

  useEffect(() => {
    showVerify === true ? runFacemesh() : "";
  }, [showVerify]);

  useEffect(() => {
    pictureCLicked === 5 ? setShhowVerify(false) : "";
  }, [pictureCLicked]);

  // PICTURE CAPTURE FUNCTION
  const capturePicture = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        setCapturedPictures((prevPictures) => [...prevPictures, screenshot]);
      }
    }
  };

  // PICTURE CLICK AUTOMATED FUNCTION
  useEffect(() => {
    (pictureCLicked === 0 && side === "Front" && topBottom === "Front") ||
    (pictureCLicked === 1 && side === "Right" && noFaceDetected === false) ||
    (pictureCLicked === 2 && side === "Left") ||
    (pictureCLicked === 3 && topBottom === "Up") ||
    (pictureCLicked === 4 && topBottom === "Down")
      ? (capturePicture(), setPictureClicked((prev) => prev + 1))
      : "";
  }, [side, topBottom]);

  useEffect(() => {
    pictureCLicked >= 5
      ? setFormData({
          ...formData,
          images: capturedPictures,
        })
      : "";
  }, [capturedPictures]);

  // const urlSearchParams = new URLSearchParams(window.location.search);
  // const cid = urlSearchParams.get("cid");

  // console.log(currentUrl, cid);

  // useEffect(() => {
  // fetch(`http://127.0.0.1:8000/company?cid=${cid}`)
  //     // fetch(`${currentUrl}, cid=${cid}`)
  //     .then((response) => {
  //         if (!response.ok) {
  //             throw new Error(`HTTP error! Status: ${response.status}`);
  //         }
  //         return response.json();
  //     })
  //     .then((data) => {
  //         // Handle the retrieved data
  //         console.log("API Data:", data);
  //         setApiData(data);
  //     })
  //     .catch((error) => {
  //         console.error("Error fetching API data:", error);
  //     });
  // }, []);

  return (
    <div className="flex justify-center w-full">
      <div
        className={`${
          showVerify ? "bg_primary" : "bg-gray-100 dark:bg-gray-900 "
        } relative flex items-top justify-center min-h-screen sm:items-center  sm:pt-4 `}
      >
        <div className="w-full">
          {showVerify ? (
            <>
              <div className="information">
                <p className="title">Face ID</p>
                <div className="lines">
                  <div
                    className={`${
                      pictureCLicked >= 1 ? "lines-success" : "lines-regular"
                    }`}
                  ></div>
                  <div
                    className={`${
                      pictureCLicked >= 2 ? "lines-success" : "lines-regular"
                    }`}
                  ></div>
                  <div
                    className={`${
                      pictureCLicked >= 3 ? "lines-success" : "lines-regular"
                    }`}
                  ></div>
                  <div
                    className={`${
                      pictureCLicked >= 4 ? "lines-success" : "lines-regular"
                    }`}
                  ></div>
                  <div
                    className={`${
                      pictureCLicked >= 5 ? "lines-success" : "lines-regular"
                    }`}
                  ></div>
                </div>
                {noFaceDetected ? (
                  <>
                    <p className="messages">No Face Detected</p>
                    <p className="messages2">Please keep your face Straight</p>
                  </>
                ) : (
                  <>
                    <p className="messages">
                      {noFaceDetected
                        ? "No Face Detected"
                        : pictureCLicked === 0
                        ? "Front Face"
                        : pictureCLicked === 1
                        ? "Right Face"
                        : pictureCLicked === 2
                        ? "Left Face"
                        : pictureCLicked === 3
                        ? "Upper Front  Face"
                        : pictureCLicked === 4
                        ? "Bottom Front Face"
                        : ""}
                    </p>
                    <p className="messages2">
                      {noFaceDetected
                        ? "No Face Detected"
                        : pictureCLicked === 0
                        ? "Please keep your face 'Straight'"
                        : pictureCLicked === 1
                        ? "Slightly move your face to the 'Left'"
                        : pictureCLicked === 2
                        ? "Slightly move your face to the 'Right'"
                        : pictureCLicked === 3
                        ? "Move you face a little bit 'Upper'"
                        : pictureCLicked === 4
                        ? "Move you face a little bit 'Down'"
                        : ""}
                    </p>
                  </>
                )}
              </div>
              <div className="webCam">
                <Webcam ref={webcamRef} className="webCam-view" />
                <canvas ref={canvasRef} className="webCam-view"></canvas>
              </div>
              {/* {(pictureCLicked === 0 &&
                                side === "Front" &&
                                topBottom === "Front") ||
                            (pictureCLicked === 1 &&
                                side === "Right" &&
                                noFaceDetected === false) ||
                            (pictureCLicked === 2 && side === "Left") ||
                            (pictureCLicked === 3 && topBottom === "Up") ||
                            (pictureCLicked === 4 && topBottom === "Down") ? ( */}
              {/* <button
                                onClick={() => {
                                    capturePicture();
                                    setPictureClicked((prev) => prev - 1);
                                }}
                                className="captureButton-success"
                            >
                                Retake
                            </button> */}
              {/* ) : (
                                <button className="captureButton" disabled>
                                    Click
                                </button>
                            )} */}
            </>
          ) : (
            <div className="flex justify-center sm:justify-start w-full">
              <div className="container mt-5 form w-full bg_dark">
                <h2 className="text-center heading white">
                  Facial Recognition System
                </h2>
                <h3 className="text-center title white">
                  Employee Information Form
                </h3>
                <form id="form" action="/submit">
                  <div className="mb-3">
                    <p className="label">Name</p>
                    <input
                      type="text"
                      className="input"
                      id="name"
                      name="name"
                      value={formData.name}
                      required
                      onChange={(e) => handleInputChange(e)}
                    />
                  </div>
                  <div className="mb-3">
                    <p className="label">Company Name</p>
                    <select
                      className="input font_14"
                      id="company"
                      name="company"
                      onChange={(e) => handleSelectChange(e)}
                      value={formData.company}
                      required
                    >
                      <option value="" disabled>
                        Select Company
                      </option>
                      <option value="company1">SG</option>
                      <option value="company2">Bondstein</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <p className="label">Employee ID</p>
                    <input
                      type="text"
                      className="input"
                      id="employeeID"
                      name="employeeID"
                      value={formData.employeeID}
                      onChange={(e) => handleInputChange(e)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <p className="label">Phone Number</p>
                    <input
                      type="tel"
                      className="input"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange(e)}
                      required
                    />
                  </div>
                  {capturedPictures.length > 0 ? (
                    ""
                  ) : (
                    <p className="message">
                      *Please make sure your face is properly visible. Take 5
                      pictures. Click on the{" "}
                      <strong>Complete Your Face Registration</strong> to verify
                      your identity.
                    </p>
                  )}

                  {/* IMAGES */}
                  <div className="captured-pictures">
                    {capturedPictures.map((picture, index) => (
                      <img
                        key={index}
                        src={picture}
                        alt={`Captured ${index + 1}`}
                        className="captured-picture"
                      />
                    ))}
                  </div>
                  <button
                    id="openCameraBtn"
                    className={`${
                      capturedPictures.length === 5
                        ? "verify-btn-success"
                        : "verify-btn"
                    }`}
                    onClick={() =>
                      capturedPictures.length === 5 ? "" : setShhowVerify(true)
                    }
                  >
                    {capturedPictures.length >= 5
                      ? "Verification Completed 😊"
                      : "Complete Your Face Registration"}
                  </button>

                  {/* SUBMIT BUTTON */}
                  <div className="text-center">
                    {formData.name.length > 0 &&
                    formData.company.length > 0 &&
                    formData.phoneNumber.length > 0 &&
                    formData.employeeID.length > 0 &&
                    formData.images.length > 0 ? (
                      <button type="submit" className="submit-btn">
                        Submit
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="submit-btn-disabled"
                        disabled
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
