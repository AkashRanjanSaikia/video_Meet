import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const withValidMeeting = (WrappedComponent) => {
  return (props) => {
    const { url } = useParams();
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
      (async () => {
        try {
          const res = await fetch(`https://videomeet-8y4i.onrender.com/api/meetings/join/${url}`);
          const data = await res.json();

          if (data.success) setIsValid(true);
          else navigate("/");
        } catch (err) {
          navigate("/");
        }
      })();
    }, [url, navigate]);

    return isValid ? <WrappedComponent {...props} /> : <p>Loading...</p>;
  };
};

export default withValidMeeting;
