import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  makeStyles,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";

import {
  ArrowForward,
  ArrowRight,
  Email,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@material-ui/icons";

// import "./style.css";
import "../../assets/style.css";
import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";
import carrossel1 from "./img/carrossel1.jpg";
import carrossel2 from "./img/carrossel2.jpg";
import carrossel3 from "./img/carrossel3.jpg";
import carrossel4 from "./img/carrossel4.jpg";
import carrossel5 from "./img/carrossel5.jpg";
import wave from "../../assets/wave.png";
import bg from "../../assets/movie.mp4";

// import avatar from '../../assets/avatar.svg'
import logo from "../../assets/logo1.png";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    flex: 1,
    position: "relative",
  },
  leftScreen: {
    flex: 2,
    [theme.breakpoints.down("sm", "xs")]: {
      display: "none",
    },
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  rightScreen: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100vw",
    },
  },
}));

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { handleLogin } = useContext(AuthContext);
  const classes = useStyles();
  const handleChangeInput = (e) => {
    if (rememberMe) {
      localStorage.setItem("email", user.email);
      localStorage.setItem("password", e.target.value);
    } else {
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail && savedPassword) {
      setUser({
        email: savedEmail,
        password: savedPassword,
      });

      setRememberMe(true);
    }
  }, []);

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  const handleChangeCheck = (e) => {
    setRememberMe(e);
    if (e) {
      localStorage.setItem("email", user.email);
      localStorage.setItem("password", user.password);
    } else {
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }
  };

  const imagens = [
    {
      id: "1",
      image: carrossel1,
    },
    {
      id: "2",
      image: carrossel2,
    },
    {
      id: "3",
      image: carrossel3,
    },
    {
      id: "4",
      image: carrossel4,
    },
    {
      id: "5",
      image: carrossel5,
    },
  ];

  return (
    <>
      {/* <img className="wave" src={wave} /> */}
      <div className={classes.root}>
        <div className={classes.leftScreen}>
          {/* <video autoPlay loop muted className={classes.video}>
            <source src={bg} type="video/mp4" />
          </video> */}
          <Carousel
            autoPlay
            interval={2500}
            infiniteLoop
            emulateTouch={false}
            showThumbs={false}
            showStatus={false}
          >
            {imagens.map((image, index) => (
              <div key={index}>
                <img
                  src={image.image}
                  alt={`Slide ${index + 1}`}
                  style={{ width: "100%", height: "100vh", objectFit: "cover" }}
                />
              </div>
            ))}
          </Carousel>
        </div>
        <div
          //   className="login-content"
          className={classes.rightScreen}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "80%",
            }}
          >
            <img
              src={logo}
              alt={logo}
              style={{
                width: "200%",
                height: "50%",
                maxWidth: "300px",
                marginBottom: 20,
              }}
            />
            <form
              noValidate
              onSubmit={handlSubmit}
              style={{
                display: "flex",
                flexDirection: "column",

                width: "100%",
              }}
            >
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label={i18n.t("login.form.email")}
                name="email"
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      style={{ marginRight: 10, color: "gray" }}
                    >
                      <Email color="inherit" />
                    </InputAdornment>
                  ),
                }}
                value={user.email}
                onChange={handleChangeInput}
                autoComplete="email"
                autoFocus
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label={i18n.t("login.form.password")}
                id="password"
                value={user.password}
                onChange={handleChangeInput}
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((e) => !e)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        id="check"
                        checked={rememberMe}
                        onChange={(e) => handleChangeCheck(e.target.checked)}
                      />
                    }
                    label="Lembrar Usuário"
                  />
                </div>
                <Link
                  href="#"
                  variant="body2"
                  component={RouterLink}
                  to="/recovery-password"
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "rgba(0, 0, 0, 0.87)",
                  }}
                >
                  {i18n.t("Recuperar Senha?")}
                </Link>
              </div>

              <button type="submit" className="btnLogin">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <ArrowForward />
                  <span>Entrar</span>
                </div>
              </button>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "rgba(0, 0, 0, 0.87)",
                  }}
                >
                  {i18n.t("Não tem conta?")}
                </span>
                <Link
                  href="/signup"
                  variant="body2"
                  component={RouterLink}
                  to="/signup"
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "rgba(0, 0, 0, 0.87)",
                  }}
                >
                  <span>Cadastre-se</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
