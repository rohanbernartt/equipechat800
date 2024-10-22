import React, { useState, useEffect } from "react";
import qs from "query-string";
import PhoneInput from "react-phone-input-2";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import { FormControl } from "@material-ui/core";
import { InputLabel, MenuItem, Select } from "@material-ui/core";
import signup from "../../assets/signup.jpg";
import soLogo from "../../assets/SoLogo.png";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import Checkbox from "@material-ui/core/Checkbox";
import LinearProgress from "@material-ui/core/LinearProgress";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// const Copyright = () => {
// 	return (
// 		<Typography variant="body2" color="textSecondary" align="center">
// 			{"Copyleft "}
// 			<Link color="inherit" href="https://github.com/canove">
// 				Canove
// 			</Link>{" "}
// 			{new Date().getFullYear()}
// 			{"."}
// 		</Typography>
// 	);
// };

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100%",
    height: "100vh",
    flex: 1,
    // position: "relative",
  },
  leftScreen: {
    width: "50%",
    height: "100%",

    [theme.breakpoints.down("sm", "xs")]: {
      display: "none",
    },
  },
  paper: {
    flex: 1,
    paddingTop: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowY: "auto",
    height: `calc(${window.innerHeight}px * 1)`,
    paddingBottom: theme.spacing(4),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "85%",
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    display: "block",
    width: " 100%",
    height: "40px",
    borderRadius: "5px",
    outline: "none",
    border: "none",
    backgroundColor: " #0596cd",
    /* background-image: linear-gradient(to right, #065183, #065183, #065183); */
    backgroundSize: "200%",
    fontSize: "0.875rem",
    color: "#f7f7f7",
    fontFamily: ["Poppins", "sans-serif"],
    textTransform: "uppercase",
    margin: "1rem 0",
    cursor: "pointer",
    transition: "0.5s",
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Nome é obrigatório"),
  companyName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Nome da empresa é obrigatória"),
  password: Yup.string()
    .min(8, "")
    .matches(/[a-z]/, " ")
    .matches(/[A-Z]/, " ")
    .required("Senha é obrigatória"),
  email: Yup.string().email("Invalid email").required("E-mail é obrigatório"),
  phone: Yup.string().required("Phone é obrigatório"),
  termo: Yup.boolean()
    .oneOf([true], "Você deve aceitar os termos para continuar.")
    .required("A aceitação dos termos é obrigatória"),
});

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();
  const { getPlanPublicList } = usePlans();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  let companyId = null;
  const params = qs.parse(window.location.search);
  if (params.companyId !== undefined) {
    companyId = params.companyId;
  }

  const calculateProgress = (password) => {
    let progress = 0;
    if (password.length >= 8) progress += 33;
    if (/[a-z]/.test(password)) progress += 33;
    if (/[A-Z]/.test(password)) progress += 34;
    return progress;
  };

  const initialState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId,
    companyName: "",
    planId: "",
    termo: false,
  };

  const [user] = useState(initialState);
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const planList = await getPlanPublicList({isPublic: true});

      setPlans(planList);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignUp = async (values) => {
    console.log(values);

    try {
      await openApi.post("/auth/signup", values);
      toast.success(i18n.t("signup.toasts.success"));
      history.push("/login");
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      {/* <CssBaseline /> */}
      <div className={classes.leftScreen}>
        <img
          src={signup}
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
        />
      </div>
      <div className={classes.paper}>
        {/* <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar> */}
        <img src={soLogo} width={100} height={100} />
        <Typography component="h1" variant="h5">
          {i18n.t("signup.title")}
        </Typography>
        {/* <form className={classes.form} noValidate onSubmit={handleSignUp}> */}
        <Formik
          initialValues={user}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSignUp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    autoComplete="name"
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    size="small"
                    fullWidth
                    id="name"
                    label={i18n.t("signup.form.name")}
                    // autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    size="small"
                    id="companyName"
                    label={i18n.t("signup.form.company")}
                    error={touched.companyName && Boolean(errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                    name="companyName"
                    autoComplete="companyName"
                    autoFocus
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="email"
                    size="small"
                    label={i18n.t("signup.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    name="password"
                    size="small"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    label={i18n.t("signup.form.password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <div
                    style={{
                      width: "100%",

                      marginTop: "10px",
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(values.password)}
                      color="primary"
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        marginTop: "5px",
                      }}
                    >
                      <span
                        style={{
                          color: values.password.length >= 8 ? "green" : "red",
                        }}
                      >
                        8+ caracteres
                      </span>
                      <span
                        style={{
                          color: /[a-z]/.test(values.password)
                            ? "green"
                            : "red",
                        }}
                      >
                        Minúscula
                      </span>
                      <span
                        style={{
                          color: /[A-Z]/.test(values.password)
                            ? "green"
                            : "red",
                        }}
                      >
                        Maiúscula
                      </span>
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Field
                    name="phone"
                    render={({ field }) => (
                      <PhoneInput
                        country={"br"}
                        value={values.wpp}
                        onChange={(value) => {
                          setFieldValue("phone", value);
                        }}
                        inputStyle={{
                          height: 40,
                          width: "100%",
                        }}
                        containerStyle={{
                          height: 40,
                        }}
                      />
                    )}
                  />
                  {errors.phone && touched.phone ? (
                    <div style={{ color: "red" }}>{errors.phone}</div>
                  ) : null}
                  {/* <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="phone"
                    label={i18n.t("signup.form.phone")}
                    name="phone"
                    autoComplete="phone"
                  /> */}
                </Grid>

                {/* TOKEN */}
                {/* <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        variant="outlined"
                                        fullWidth
                                        id="token"
                                        label={i18n.t("auth.token")}
                                        name="token"
                                        autoComplete="token"
                                    />
                                </Grid> */}

                <Grid item xs={12}>
                  <InputLabel htmlFor="plan-selection">Plano</InputLabel>
                  <Field
                    as={Select}
                    variant="outlined"
                    fullWidth
                    id="plan-selection"
                    label="Plano"
                    name="planId"
                    required
                    style={{
                      height: 40,
                    }}
                  >
                    {plans.map((plan, key) => (
                      <MenuItem key={key} value={plan.id}>
                        {plan.name} - Atendentes: {plan.users} - WhatsApp:{" "}
                        {plan.connections} - Filas: {plan.queues} - R${" "}
                        {plan.amount}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={values.termo}
                        onChange={(event) => {
                          setFieldValue("termo", event.target.checked);
                        }}
                        color="primary"
                        name="termo"
                      />
                    }
                    style={{ alignItems: "flex-start", marginRight: "5px" }}
                    label={
                      <span
                        style={{
                          textAlign: "justify",
                          fontSize: "14px",
                          paddingTop: "5px",
                        }}
                      >
                        Li e aceito os termos de uso do produto e declaro que
                        estou, integralmente, de acordo com estes Termos e com o
                        uso da plataforma EquipeChat, bem como que, neste ato,
                        possuo os necessários poderes para contratar e assumir
                        as declarações previstas nestes Termos.
                      </span>
                    }
                  />
                  {errors.termo && touched.termo ? (
                    <div style={{ color: "red" }}>{errors.termo}</div>
                  ) : null}
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={isSubmitting}
              >
                {i18n.t("signup.buttons.submit")}
              </Button>
              <div style={{ textAlign: "end" }}>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    component={RouterLink}
                    to="/login"
                  >
                    {i18n.t("signup.buttons.login")}
                  </Link>
                </Grid>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      {/* <Box mt={5}><Copyright /></Box> */}
    </div>
  );
};

export default SignUp;
