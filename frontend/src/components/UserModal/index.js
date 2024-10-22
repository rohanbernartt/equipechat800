import React, { useState, useEffect, useContext, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import whatsappIcon from "../../assets/nopicture.png";
import { i18n } from "../../translate/i18n";
import LinearProgress from "@material-ui/core/LinearProgress";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import useWhatsApps from "../../hooks/useWhatsApps";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Can } from "../Can";
import { Avatar, Input } from "@material-ui/core";
import { getBackendUrl } from "../../config";

const backendUrl = getBackendUrl();
const path = require("path");

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    margin: theme.spacing(2),
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid #ccc",
  },
  updateDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  updateInput: {
    display: "none",
  },
  updateLabel: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textTransform: "uppercase",
    textAlign: "center",
    cursor: "pointer",
    border: "2px solid #ccc",
    borderRadius: "5px",
    minWidth: 160,
    fontWeight: "bold",
    color: "#555",
  },
  errorUpdate: {
    border: "2px solid red",
  },
  errorText: {
    color: "red",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  colorRed: {
    color: "red",
  },
  colorGreen: {
    color: "green",
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Nome é obrigatório"),
  password: Yup.string()
    .min(8, "")
    .matches(/[a-z]/, " ")
    .matches(/[A-Z]/, " ")
    .required("Senha é obrigatória"),
  email: Yup.string().email("Invalid email").required("E-mail é obrigatório"),
});

const UserModal = ({ open, onClose, userId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    email: "",
    password: "",
    profile: "user",
    startWork: "00:00",
    endWork: "23:59",
    farewellMessage: "",
    allTicket: "disable",
    allowGroup: false,
    defaultTheme: "light",
    defaultMenu: "open",
    wpp: "",
  };

  const { user: loggedInUser } = useContext(AuthContext);

  const [user, setUser] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [selectedQueueIdsRead, setSelectedQueueIdsRead] = useState([]);
  const [whatsappId, setWhatsappId] = useState(false);
  const { loading, whatsApps } = useWhatsApps();
  const [profileUrl, setProfileUrl] = useState(null);

  const startWorkRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const endWorkRef = useRef();

  const calculateProgress = (password) => {
    let progress = 0;
    if (password.length >= 8) progress += 33;
    if (/[a-z]/.test(password)) progress += 33;
    if (/[A-Z]/.test(password)) progress += 34;
    return progress;
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}`);
        setUser((prevState) => {
          return { ...prevState, ...data };
        });

        const { profileImage } = data;
        setProfileUrl(
          `${backendUrl}/public/company${data.companyId}/user/${profileImage}`
        );

        const userQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(userQueueIds);
        setWhatsappId(data.whatsappId ? data.whatsappId : "");
      } catch (err) {
        toastError(err);
      }
    };

    fetchUser();
  }, [userId, open]);

  const handleClose = () => {
    onClose();
    setUser(initialState);
  };

  const handleSaveUser = async (values) => {
    const uploadAvatar = async (file) => {
      const formData = new FormData();
      formData.append("userId", file.id);
      formData.append("typeArch", "user");
      formData.append("profileImage", file.profileImage);

      const { data } = await api.post(
        `/users/${file.id}/media-upload`,
        formData
      );

      localStorage.setItem("profileImage", data.user.profileImage);
    };
    const userData = {
      ...values,
      whatsappId,
      queueIds: selectedQueueIds,
    };

    try {
      if (userId) {
        const { data } = await api.put(`/users/${userId}`, userData);
        window.localStorage.setItem("preferredTheme", values.defaultTheme);

        if (
          user.profileImage &&
          user.profileImage !== path.basename(profileUrl)
        )
          uploadAvatar(user);
      } else {
        const { data } = await api.post("/users", userData);
        window.localStorage.setItem("preferredTheme", values.defaultTheme);

        if (user.profileImage && user.avatar) uploadAvatar(user);
      }

      toast.success(i18n.t("userModal.success"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const handleUpdateProfileImage = (e) => {
    if (!e.target.files[0]) return;

    const newAvatarUrl = URL.createObjectURL(e.target.files[0]);
    setUser((prevState) => ({
      ...prevState,
      avatar: newAvatarUrl,
      profileImage: e.target.files[0],
    }));
    setProfileUrl(newAvatarUrl);
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {userId
            ? `${i18n.t("userModal.title.edit")}`
            : `${i18n.t("userModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={user}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveUser(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form style={{ width: "100%" }}>
              <DialogContent dividers>
                <FormControl className={classes.updateDiv}>
                  <label htmlFor="profileImage">
                    <Avatar
                      src={profileUrl ? profileUrl : whatsappIcon}
                      alt="profile-image"
                      className={`${classes.avatar} ${
                        touched.profileImage && errors.profileImage
                          ? classes.errorUpdate
                          : ""
                      }`}
                    />
                  </label>
                  <FormControl className={classes.updateDiv}>
                    <label
                      htmlFor="profileImage"
                      className={`${classes.updateLabel} ${
                        touched.profileImage && errors.profileImage
                          ? classes.errorUpdate
                          : ""
                      }`}
                    >
                      {profileUrl
                        ? i18n.t("userModal.title.updateImage")
                        : i18n.t("userModal.buttons.addImage")}
                    </label>
                    {touched.profileImage && errors.profileImage && (
                      <span className={classes.errorText}>
                        {errors.profileImage}
                      </span>
                    )}
                    <Input
                      type="file"
                      name="profileImage"
                      id="profileImage"
                      className={classes.updateInput}
                      onChange={(event) => handleUpdateProfileImage(event)}
                    />
                  </FormControl>
                  {user.avatar && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setUser((prevState) => ({
                          ...prevState,
                          avatar: null,
                          profileImage: null,
                        }));
                        setProfileUrl(whatsappIcon);
                      }}
                    >
                      {i18n.t("userModal.title.removeImage")}
                    </Button>
                  )}
                </FormControl>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("userModal.form.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("userModal.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>

                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("userModal.form.password")}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    variant="outlined"
                    margin="dense"
                    fullWidth
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
                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                    margin="dense"
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.profile === "admin"}
                          onChange={(event) => {
                            setFieldValue(
                              "profile",
                              event.target.checked ? "admin" : "user"
                            );
                          }}
                          name="profile"
                          color="primary"
                        />
                      }
                      label={values.profile === "admin" ? "Admin" : "User"}
                    />
                  </FormControl>
                </div>
                <div style={{ width: "100%", marginBottom: "10px" }}>
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
                        color: /[a-z]/.test(values.password) ? "green" : "red",
                      }}
                    >
                      Minúscula
                    </span>
                    <span
                      style={{
                        color: /[A-Z]/.test(values.password) ? "green" : "red",
                      }}
                    >
                      Maiúscula
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <Field
                    name="wpp"
                    render={({ field }) => (
                      <PhoneInput
                        country={"br"}
                        value={values.wpp}
                        onChange={(value) => {
                          setFieldValue("wpp", value);
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
                </div>
                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editQueues"
                  yes={() => (
                    <QueueSelect
                      selectedQueueIds={selectedQueueIds}
                      onChange={(values) => setSelectedQueueIds(values)}
                      fullWidth
                    />
                  )}
                />
                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editQueues"
                  yes={() => (
                    <>
                      <QueueSelect
                        selectedQueueIds={selectedQueueIdsRead}
                        onChange={(values) => setSelectedQueueIdsRead(values)}
                        fullWidth
                        label={"RO"}
                      />
                    </>
                  )}
                />
                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editProfile"
                  yes={() => (
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      className={classes.maxWidth}
                      fullWidth
                    >
                      <InputLabel>
                        {i18n.t("userModal.form.whatsapp")}
                      </InputLabel>
                      <Field
                        as={Select}
                        value={whatsappId}
                        onChange={(e) => setWhatsappId(e.target.value)}
                        label={i18n.t("userModal.form.whatsapp")}
                      >
                        <MenuItem value={""}>&nbsp;</MenuItem>
                        {whatsApps.map((whatsapp) => (
                          <MenuItem key={whatsapp.id} value={whatsapp.id}>
                            {whatsapp.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  )}
                />
                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editProfile"
                  yes={() => (
                    <div className={classes.multFieldLine}>
                      <Field
                        as={TextField}
                        label={i18n.t("userModal.form.startWork")}
                        type="time"
                        ampm={"false"}
                        inputRef={startWorkRef}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 600, // 5 min
                        }}
                        fullWidth
                        name="startWork"
                        error={touched.startWork && Boolean(errors.startWork)}
                        helperText={touched.startWork && errors.startWork}
                        variant="outlined"
                        margin="dense"
                        className={classes.textField}
                      />
                      <Field
                        as={TextField}
                        label={i18n.t("userModal.form.endWork")}
                        type="time"
                        ampm={"false"}
                        inputRef={endWorkRef}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 600, // 5 min
                        }}
                        fullWidth
                        name="endWork"
                        error={touched.endWork && Boolean(errors.endWork)}
                        helperText={touched.endWork && errors.endWork}
                        variant="outlined"
                        margin="dense"
                        className={classes.textField}
                      />
                    </div>
                  )}
                />

                <Field
                  as={TextField}
                  label={i18n.t("userModal.form.farewellMessage")}
                  type="farewellMessage"
                  multiline
                  rows={4}
                  fullWidth
                  name="farewellMessage"
                  error={
                    touched.farewellMessage && Boolean(errors.farewellMessage)
                  }
                  helperText={touched.farewellMessage && errors.farewellMessage}
                  variant="outlined"
                  margin="dense"
                />
                <div className={classes.multFieldLine}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.allTicket === "enable" ? true : false}
                        onChange={(event) => {
                          setFieldValue(
                            "allTicket",
                            event.target.checked ? "enable" : "disable"
                          );
                        }}
                        name="allTicket"
                        color="primary"
                      />
                    }
                    label="Visualizar chamados sem fila"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.allowGroup}
                        onChange={(event) => {
                          setFieldValue("allowGroup", event.target.checked);
                        }}
                        name="allowGroup"
                        color="primary"
                      />
                    }
                    label="Permitir Grupos"
                  />
                </div>
                {/* <div className={classes.multFieldLine}>
                  <FormControl
                    variant="outlined"
                    className={classes.maxWidth}
                    margin="dense"
                    fullWidth
                  >
                    <>
                      <InputLabel>
                        {i18n.t("userModal.form.defaultTheme")}
                      </InputLabel>

                      <Field
                        as={Select}
                        label={i18n.t("userModal.form.defaultTheme")}
                        name="defaultTheme"
                        type="defaultTheme"
                        required
                      >
                        <MenuItem value="light">
                          {i18n.t("userModal.form.defaultThemeLight")}
                        </MenuItem>
                        <MenuItem value="dark">
                          {i18n.t("userModal.form.defaultThemeDark")}
                        </MenuItem>
                      </Field>
                    </>
                  </FormControl>
                </div> */}
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("userModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {userId
                    ? `${i18n.t("userModal.buttons.okEdit")}`
                    : `${i18n.t("userModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default UserModal;
