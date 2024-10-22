import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { getBackendUrl } from "../config";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import UserModal from "../components/UserModal";
import styled from "styled-components";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Divider from "@material-ui/core/Divider";
import {
  Avatar,
  Badge,
  Collapse,
  useTheme,
  IconButton,
  FormControl,
  MenuItem,
  Menu,
  List,
  makeStyles,
  withStyles,
} from "@material-ui/core";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import ViewKanban from "@mui/icons-material/ViewKanban";
import Schedule from "@material-ui/icons/Schedule";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import BusinessIcon from "@material-ui/icons/Business";
import ViewListOutlinedIcon from "@material-ui/icons/ViewListOutlined";
import {
  AddToQueueRounded,
  AttachFile,
  CalendarToday,
  DeviceHubOutlined,
  ExploreOutlined,
  Label,
  AllInclusive,
} from "@material-ui/icons";

import Typography from "@material-ui/core/Typography";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { socketConnection } from "../services/socket";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";

import { Tooltip } from "@mui/material";
import UserLanguageSelector from "../components/UserLanguageSelector";
import ColorModeContext from "../layout/themeContext";
import { Description } from '@mui/icons-material';
// import logo from "../assets/logo.png";

const useStyles = makeStyles((theme) => ({
  avatar2: {
    width: "100%",
    height: "50px",
    cursor: "pointer",
    // [theme.breakpoints.down("xs")]: {
    //   display: "none",
    // },
  },
  theme: {},
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const MenuButton = styled.div`
  color: white;
  display: flex;
  justify-content: end;
  align-items: center;
  width: "40px";

  border-radius: 50px;
  background-color: transparent;
  padding: 8px;
  cursor: pointer;
  &:hover {
    background-color: #24272c;
  }
`;

const Theme = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 20px;
  margin-left: 28px;
  &:hover {
    background-color: #24272c;
  }
`;

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem dense button component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props, { collapsed }) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openKanbanSubmenu, setOpenKanbanSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const backendUrl = getBackendUrl();
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);
  // novas features
  const [showSchedules, setShowSchedules] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const history = useHistory();
  const classes = useStyles();
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const { getPlanCompany } = usePlans();
  const theme = useTheme();
  const { getVersion } = useVersion();
  const { colorMode } = useContext(ColorModeContext);
  const [isAdmin, setIsAdmin] = useState(user.profile === 'admin');
  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  };
  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const companyId = user.companyId;
    const userId = user.id;

    const socket = socketConnection({ companyId, userId: user.id });
    const ImageUrl = user.profileImage;

    if (ImageUrl !== undefined && ImageUrl !== null)
      setProfileUrl(
        `${backendUrl}/public/company${companyId}/user/${ImageUrl}`
      );
    else setProfileUrl(`${process.env.FRONTEND_URL}/nopicture.png`);

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setShowIntegration(planConfigs.plan.useIntegration);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  // useEffect(() => {
  //   if (localStorage.getItem("cshow")) {
  //     setShowCampaigns(true);
  //   }
  // }, []);
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    if (theme.mode === "dark") toggleColorMode();
    handleCloseMenu();
    handleLogout();
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div style={{ height: "100dvh" }}>
      <div
        style={{
          // marginTop: -8,
          position: "fixed",
          left: 0,
          top: 0,
          width: "85px",
          zIndex: 99,
        }}
      >
        <StyledBadge
          overlap="circular"
          // anchorOrigin={{
          //   vertical: "bottom",
          //   horizontal: "right",
          // }}
          // variant="dot"
          onClick={handleMenu}
          style={{ width: "100%" }}
        >
          <Avatar
            alt="Multi100"
            style={{ borderRadius: 0 }}
            className={classes.avatar2}
            src={profileUrl}
          />
        </StyledBadge>
        <UserModal
          open={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
          userId={user?.id}
        />

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={menuOpen}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleOpenUserModal}>
            {i18n.t("mainDrawer.appBar.user.profile")}
          </MenuItem>
          <MenuItem onClick={handleClickLogout}>
            {i18n.t("mainDrawer.appBar.user.logout")}
          </MenuItem>
        </Menu>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <div style={{ marginTop: "70px" }}>
          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <>
              <ListItemLink
                to="/"
                // primary="Dashboard"
                icon={
                  <Tooltip
                    title="Dashboard"
                    arrow
                    color="#FFF"
                    placement="right"
                  >
                    <MenuButton
                      style={{
                        marginLeft: 10,
                      }}
                    >
                      <DashboardOutlinedIcon
                        color="inherit"
                        style={{
                          color: "#FFF",
                          width: 20,
                          height: 20,
                        }}
                      />
                    </MenuButton>
                  </Tooltip>
                }
              />
              <ListItemLink
                to="/reports"
                // primary="Dashboard"
                icon={
                  <Tooltip
                    title={i18n.t("mainDrawer.listItems.Gridreports")}
                    arrow
                    color="#FFF"
                    placement="right"
                  >
                    <MenuButton
                      style={{
                        marginLeft: 10,
                      }}
                    >
                      <Description
                        color="inherit"
                        style={{
                          color: "#FFF",
                          width: 20,
                          height: 20,
                        }}
                      />
                    </MenuButton>
                  </Tooltip>
                }
                />
              </>
            )}
          />
          <ListItemLink
            to="/tickets"
            // primary={i18n.t("mainDrawer.listItems.tickets")}
            icon={
              <Tooltip
                title={i18n.t("mainDrawer.listItems.tickets")}
                arrow
                color="#FFF"
                placement="right"
              >
                <MenuButton
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <WhatsAppIcon
                    color="inherit"
                    style={{
                      color: "#FFF",
                      width: 20,
                      height: 20,
                    }}
                  />
                </MenuButton>
              </Tooltip>
            }
          />
          <ListItemLink
            to="/moments"
            // primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
            icon={
              <Tooltip
                title={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                arrow
                color="#FFF"
                placement="right"
              >
                <MenuButton
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <ViewListOutlinedIcon
                    color="inherit"
                    style={{
                      color: "#FFF",
                      width: 20,
                      height: 20,
                    }}
                  />
                </MenuButton>
              </Tooltip>
            }
          />
          <ListItemLink
            to="/quick-messages"
            // primary={i18n.t("mainDrawer.listItems.quickMessages")}
            icon={
              <Tooltip
                title={i18n.t("mainDrawer.listItems.quickMessages")}
                arrow
                color="#FFF"
                placement="right"
              >
                <MenuButton
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <FlashOnIcon
                    color="inherit"
                    style={{
                      color: "#FFF",
                      width: 20,
                      height: 20,
                    }}
                  />
                </MenuButton>
              </Tooltip>
            }
          />
          {showKanban && (
            <>
              <ListItem
                dense
                button
                onClick={() => setOpenKanbanSubmenu((prev) => !prev)}
              >
                <ListItemIcon>
                  <Tooltip
                    title={i18n.t("mainDrawer.listItems.kanban")}
                    arrow
                    color="#FFF"
                    placement="right"
                  >
                    <MenuButton
                      style={{
                        marginLeft: 10,
                      }}
                    >
                      <ViewKanban
                        color="inherit"
                        style={{
                          color: "#FFF",
                          width: 20,
                          height: 20,
                        }}
                      />
                    </MenuButton>
                  </Tooltip>
                </ListItemIcon>
                {/* <ListItemText
              primary={i18n.t("mainDrawer.listItems.kanban")}
            /> */}
                {/* {openKanbanSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />} */}
              </ListItem>
              <Collapse
                style={{ paddingLeft: 15 }}
                in={openKanbanSubmenu}
                timeout="auto"
                unmountOnExit
              >
                <List dense component="div" disablePadding>
                  <ListItem onClick={() => history.push("/kanban")} button>
                    <ListItemIcon>
                      <Tooltip
                        title={i18n.t("kanban.subMenus.list")}
                        arrow
                        color="#FFF"
                        placement="right"
                      >
                        <MenuButton
                          style={{
                            marginLeft: 10,
                          }}
                        >
                          <ListIcon
                            color="inherit"
                            style={{
                              color: "#FFF",
                              width: 20,
                              height: 20,
                            }}
                          />
                        </MenuButton>
                      </Tooltip>
                    </ListItemIcon>
                    {/* <ListItemText primary={i18n.t("kanban.subMenus.list")} /> */}
                  </ListItem>
                  <ListItem onClick={() => history.push("/tagsKanban")} button>
                    <ListItemIcon>
                      <Tooltip
                        title={i18n.t("kanban.subMenus.tags")}
                        arrow
                        color="#FFF"
                        placement="right"
                      >
                        <MenuButton
                          style={{
                            marginLeft: 10,
                          }}
                        >
                          <CalendarToday
                            color="inherit"
                            style={{
                              color: "#FFF",
                              width: 20,
                              height: 20,
                            }}
                          />
                        </MenuButton>
                      </Tooltip>
                    </ListItemIcon>
                    {/* <ListItemText primary={i18n.t("kanban.subMenus.tags")} /> */}
                  </ListItem>
                </List>
              </Collapse>
            </>
          )}
          <ListItemLink
            to="/contacts"
            // primary={i18n.t("mainDrawer.listItems.contacts")}
            icon={
              <Tooltip
                title={i18n.t("mainDrawer.listItems.contacts")}
                arrow
                color="#FFF"
                placement="right"
              >
                <MenuButton
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <ContactPhoneOutlinedIcon
                    color="inherit"
                    style={{
                      color: "#FFF",
                      width: 20,
                      height: 20,
                    }}
                  />
                </MenuButton>
              </Tooltip>
            }
          />
          {showSchedules && (
            <>
              <ListItemLink
                to="/schedules"
                // primary={i18n.t("mainDrawer.listItems.schedules")}
                icon={
                  <Tooltip
                    title={i18n.t("mainDrawer.listItems.schedules")}
                    arrow
                    color="#FFF"
                    placement="right"
                  >
                    <MenuButton
                      style={{
                        marginLeft: 10,
                      }}
                    >
                      <Schedule
                        color="inherit"
                        style={{
                          color: "#FFF",
                          width: 20,
                          height: 20,
                        }}
                      />
                    </MenuButton>
                  </Tooltip>
                }
              />
            </>
          )}
          <ListItemLink
            to="/tags"
            // primary={i18n.t("mainDrawer.listItems.tags")}
            icon={
              <Tooltip
                title={i18n.t("mainDrawer.listItems.tags")}
                arrow
                color="#FFF"
                placement="right"
              >
                <MenuButton
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <LocalOfferIcon
                    color="inherit"
                    style={{
                      color: "#FFF",
                      width: 20,
                      height: 20,
                    }}
                  />
                </MenuButton>
              </Tooltip>
            }
          />
          {showInternalChat && (
            <>
              <ListItemLink
                to="/chats"
                // primary={i18n.t("mainDrawer.listItems.chats")}
                icon={
                  <Badge color="secondary" variant="dot" invisible={invisible}>
                    <Tooltip
                      title={i18n.t("mainDrawer.listItems.chats")}
                      arrow
                      color="#FFF"
                      placement="right"
                    >
                      <MenuButton
                        style={{
                          marginLeft: 10,
                        }}
                      >
                        <ForumIcon
                          color="inherit"
                          style={{
                            color: "#FFF",
                            width: 20,
                            height: 20,
                          }}
                        />
                      </MenuButton>
                    </Tooltip>
                  </Badge>
                }
              />
            </>
          )}
          <ListItemLink
            to="/helps"
            // primary={i18n.t("mainDrawer.listItems.helps")}
            icon={
              <Tooltip
                title={i18n.t("mainDrawer.listItems.helps")}
                arrow
                color="#FFF"
                placement="right"
              >
                <MenuButton
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <HelpOutlineIcon
                    color="inherit"
                    style={{
                      color: "#FFF",
                      width: 20,
                      height: 20,
                    }}
                  />
                </MenuButton>
              </Tooltip>
            }
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <Theme>
            <div
              style={{
                paddingLeft: "5px",
                paddingRight: "16px",
                paddingTop: "6px",
                paddingBottom: "4px",
                width: "100%",
                display: "flex",
                position: "relative",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Tooltip title="Dark/Light" arrow color="#FFF" placement="right">
                <IconButton
                  edge="end"
                  onClick={toggleColorMode}
                  style={{
                    color: "#FFF",
                    width: 20,
                    height: 20,
                  }}
                >
                  {theme.mode === "dark" ? (
                    <Brightness7Icon
                      style={{ color: "white", width: 20, height: 20 }}
                    />
                  ) : (
                    <Brightness4Icon
                      style={{ color: "white", width: 20, height: 20 }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>
          </Theme>
          {isAdmin && 
          <ListItemLink
            to="/settings"
            // primary={i18n.t("mainDrawer.listItems.settings")}
            icon={
              <Tooltip
                title={i18n.t("mainDrawer.listItems.settings")}
                arrow
                color="#FFF"
                placement="right"
              >
                <MenuButton
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <SettingsOutlinedIcon
                    color="inherit"
                    style={{
                      color: "#FFF",
                      width: 20,
                      height: 20,
                    }}
                  />
                </MenuButton>
              </Tooltip>
            }
          />}
        </div>
      </div>
    </div>
  );
};

export default MainListItems;
