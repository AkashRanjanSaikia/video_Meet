import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, hsl(220 25% 12%) 0%, hsl(220 25% 10%) 100%)",
        gap: 2,
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: "#6c63ff",
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }}
      />
      <Box
        component="p"
        sx={{
          color: "#e0e0e0",
          fontSize: "1rem",
          fontWeight: 500,
          letterSpacing: "0.5px",
          margin: 0,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Validating meeting...
      </Box>
    </Box>
  );
};

const withValidMeeting = (WrappedComponent) => {
  return (props) => {
    const { url } = useParams();
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
      (async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meetings/join/${url}`);
          const data = await res.json();

          if (data.success) setIsValid(true);
          else navigate("/");
        } catch (err) {
          navigate("/");
        }
      })();
    }, [url, navigate]);

    return isValid ? <WrappedComponent {...props} /> : <LoadingSpinner />;
  };
};

export default withValidMeeting;
