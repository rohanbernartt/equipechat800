import React, { useState, useEffect, useContext } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import {
  makeStyles,
  Paper,
  Tabs,
  Tab,
  Collapse,
  List,
  Badge,
} from "@material-ui/core";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import BusinessIcon from "@material-ui/icons/Business";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import { Can } from "../../components/Can";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import TabPanel from "../../components/TabPanel";
import { socketConnection } from "../../services/socket.js";
import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";
import {
  AddToQueueRounded,
  AttachFile,
  CalendarToday,
  DeviceHubOutlined,
  ExploreOutlined,
  Label,
  AllInclusive,
} from "@material-ui/icons";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import PeopleIcon from "@material-ui/icons/People";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import ListSubheader from "@material-ui/core/ListSubheader";
import useCompanies from "../../hooks/useCompanies";
import { AuthContext } from "../../context/Auth/AuthContext";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import useSettings from "../../hooks/useSettings";
import ListIcon from "@material-ui/icons/ListAlt";
import { Tooltip } from "@mui/material";
import { Link as RouterLink, useHistory } from "react-router-dom";
import styled from "styled-components";
import usePlans from "../../hooks/usePlans";
import { Ri24HoursFill } from "react-icons/ri";
const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  ContainerButton: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    overflow: "auto",
    alignItems: "center",
    position: "relative",
    scrollbarWidth: "none", // Oculta o scroll no Firefox
    msOverflowStyle: "none",
  },

  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
  },
  tab: {
    // background: "#f2f5f3",
    backgroundColor: theme.mode === "light" ? "#f2f2f2" : "#7f7f7f",
    borderRadius: 4,
  },
  paper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
  },
  control: {
    padding: theme.spacing(1),
  },
  textfield: {
    width: "100%",
  },
}));

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
`;

const SettingsCustom = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [oldSettings, setOldSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const { getPlanCompany } = usePlans();
  const [showCampaigns, setShowCampaigns] = useState(false);
  const { find, updateSchedules } = useCompanies();
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const history = useHistory();
  //novo hook
  const { getAll: getAllSettings } = useCompanySettings();
  const { getAll: getAllSettingsOld } = useSettings();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = user.companyId;
        const company = await find(companyId);

        const settingList = await getAllSettings(companyId);

        const settingListOld = await getAllSettingsOld();

        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);
        setOldSettings(settingListOld);

        /*  if (Array.isArray(settingList)) {
          const scheduleType = settingList.find(
            (d) => d.key === "scheduleType"
          );
          if (scheduleType) {
            setSchedulesEnabled(scheduleType.value === "company");
          }
        } */
        setSchedulesEnabled(settingList.scheduleType === "company");
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      //  setShowKanban(planConfigs.plan.useKanban);
      //  setShowOpenAi(planConfigs.plan.useOpenAi);
      //  setShowSchedules(planConfigs.plan.useSchedules);
      //  setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
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
      <li style={{ listStyle: "none" }}>
        <ListItem dense button component={renderLink} className={className}>
          {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
          <ListItemText primary={primary} />
        </ListItem>
      </li>
    );
  }

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser.super;
  };
  useEffect(() => {
    const companyId = user.companyId;
    const userId = user.id;

    const socket = socketConnection({ companyId, userId: user.id });
    const ImageUrl = user.profileImage;

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

  return (
    <MainContainer className={classes.root}>
        <div style={{ paddingTop: "8px" }}>
          <Title>{i18n.t("settings.title")}</Title>
        </div>
      <MainHeader>
        <div className={classes.ContainerButton}>
          <Can
            role={user.profile}
            perform="drawer-admin-items:view"
            yes={() => (
              <>
                {user.super && (
                  <ListItemLink
                    to="/announcements"
                    // primary={i18n.t("mainDrawer.listItems.annoucements")}
                    icon={
                      <Tooltip
                        title={i18n.t("mainDrawer.listItems.annoucements")}
                        arrow
                        color="#000"
                        placement="top"
                      >
                        <MenuButton>
                          <AnnouncementIcon
                            color="inherit"
                            style={{
                              color: "#000",
                              width: 30,
                              height: 30,
                            }}
                          />
                        </MenuButton>
                      </Tooltip>
                    }
                  />
                )}

                {showExternalApi && (
                  <>
                    <ListItemLink
                      to="/messages-api"
                      // primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                      icon={
                        <Tooltip
                          title={i18n.t("mainDrawer.listItems.messagesAPI")}
                          arrow
                          color="#000"
                          placement="top"
                        >
                          <MenuButton>
                            <CodeRoundedIcon
                              color="inherit"
                              style={{
                                color: "#000",
                                width: 30,
                                height: 30,
                              }}
                            />
                          </MenuButton>
                        </Tooltip>
                      }
                    />
                  </>
                )}

                <ListItemLink
                  to="/users"
                  // primary={i18n.t("mainDrawer.listItems.users")}
                  icon={
                    <Tooltip
                      title={i18n.t("mainDrawer.listItems.users")}
                      arrow
                      color="#000"
                      placement="top"
                    >
                      <MenuButton>
                        <PeopleAltOutlinedIcon
                          color="inherit"
                          style={{
                            color: "#000",
                            width: 30,
                            height: 30,
                          }}
                        />
                      </MenuButton>
                    </Tooltip>
                  }
                />
                <ListItemLink
                  to="/NotifyMe"
                  icon={
                    <Tooltip
                      title={i18n.t("mainDrawer.listItems.notifyUser")}
                      arrow
                      color="#000"
                      placement="top"
                    >
                      <MenuButton>
                        <Ri24HoursFill
                          color="inherit"
                          style={{
                            color: "#000",
                            width: 30,
                            height: 30,
                          }}
                        />
                      </MenuButton>
                    </Tooltip>
                  }
                />
                <ListItemLink
                  to="/queues"
                  // primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={
                    <Tooltip
                      title={i18n.t("mainDrawer.listItems.queues")}
                      arrow
                      color="#000"
                      placement="top"
                    >
                      <MenuButton>
                        <AccountTreeOutlinedIcon
                          color="inherit"
                          style={{
                            color: "#000",
                            width: 30,
                            height: 30,
                          }}
                        />
                      </MenuButton>
                    </Tooltip>
                  }
                />

                {/* {showOpenAi && ( */}
                <ListItemLink
                  to="/prompts"
                  // primary={i18n.t("mainDrawer.listItems.prompts")}
                  icon={
                    <Tooltip
                      title={i18n.t("mainDrawer.listItems.prompts")}
                      arrow
                      color="#000"
                      placement="top"
                    >
                      <MenuButton>
                        <AllInclusive
                          color="inherit"
                          style={{
                            color: "#000",
                            width: 30,
                            height: 30,
                          }}
                        />
                      </MenuButton>
                    </Tooltip>
                  }
                />
                {/* )} */}

                <ListItemLink
                  to="/queue-integration"
                  // primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                  icon={
                    <Tooltip
                      title={i18n.t("mainDrawer.listItems.queueIntegration")}
                      arrow
                      color="#000"
                      placement="top"
                    >
                      <MenuButton>
                        <DeviceHubOutlined
                          color="inherit"
                          style={{
                            color: "#000",
                            width: 30,
                            height: 30,
                          }}
                        />
                      </MenuButton>
                    </Tooltip>
                  }
                />

                <ListItemLink
                  to="/connections"
                  // primary={i18n.t("mainDrawer.listItems.connections")}
                  icon={
                    <Badge
                      badgeContent={connectionWarning ? "!" : 0}
                      color="error"
                    >
                      <Tooltip
                        title={i18n.t("mainDrawer.listItems.connections")}
                        arrow
                        color="#000"
                        placement="top"
                      >
                        <MenuButton>
                          <SyncAltIcon
                            color="inherit"
                            style={{
                              color: "#000",
                              width: 30,
                              height: 30,
                            }}
                          />
                        </MenuButton>
                      </Tooltip>
                    </Badge>
                  }
                />

                <ListItemLink
                  to="/files"
                  // primary={i18n.t("mainDrawer.listItems.files")}
                  icon={
                    <Tooltip
                      title={i18n.t("mainDrawer.listItems.files")}
                      arrow
                      color="#000"
                      placement="top"
                    >
                      <MenuButton>
                        <AttachFile
                          color="inherit"
                          style={{
                            color: "#000",
                            width: 30,
                            height: 30,
                          }}
                        />
                      </MenuButton>
                    </Tooltip>
                  }
                />

                {/* <ListItemLink
              to="/integrations"
              primary={'Integrações'}
              icon={<AddToQueueRounded />}
            /> */}
                {/* <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<LocalAtmIcon />}
                /> */}

                {/* {user.super && (
              <ListSubheader inset>
                {i18n.t("mainDrawer.listItems.administration")}
              </ListSubheader>
            )} */}

                {user.super && (
                  <ListItemLink
                    to="/companies"
                    // primary={i18n.t("mainDrawer.listItems.companies")}
                    icon={
                      <Tooltip
                        title={i18n.t("mainDrawer.listItems.companies")}
                        arrow
                        color="#000"
                        placement="top"
                      >
                        <MenuButton>
                          <BusinessIcon
                            color="inherit"
                            style={{
                              color: "#000",
                              width: 30,
                              height: 30,
                            }}
                          />
                        </MenuButton>
                      </Tooltip>
                    }
                  />
                )}
              </>
            )}
          />
          {showCampaigns && (
            <>
              <ListItem
                dense
                button
                onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
              >
                <ListItemIcon>
                  <Tooltip
                    title={i18n.t("mainDrawer.listItems.campaigns")}
                    arrow
                    color="#000"
                    placement="top"
                  >
                    <MenuButton>
                      <EventAvailableIcon
                        color="inherit"
                        style={{
                          color: "#000",
                          width: 30,
                          height: 30,
                        }}
                      />
                    </MenuButton>
                  </Tooltip>
                </ListItemIcon>
                {/* <ListItemText
                  primary={i18n.t("mainDrawer.listItems.campaigns")}
                /> */}
                {/* {openCampaignSubmenu ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )} */}
              </ListItem>
              <Collapse in={openCampaignSubmenu} timeout="auto" unmountOnExit>
                <List
                  dense
                  component="div"
                  // disablePadding
                  style={{
                    display: "flex",

                    padding: 0,
                  }}
                >
                  <ListItem onClick={() => history.push("/campaigns")} button>
                    <ListItemIcon>
                      <Tooltip
                        title={i18n.t("campaigns.subMenus.list")}
                        arrow
                        color="#000"
                        placement="top"
                      >
                        <MenuButton>
                          <ListIcon
                            color="inherit"
                            style={{
                              color: "#000",
                              width: 30,
                              height: 30,
                            }}
                          />
                        </MenuButton>
                      </Tooltip>
                    </ListItemIcon>
                    {/* <ListItemText primary={i18n.t("campaigns.subMenus.list")} /> */}
                  </ListItem>
                  <ListItem
                    onClick={() => history.push("/contact-lists")}
                    button
                  >
                    <ListItemIcon>
                      <Tooltip
                        title={i18n.t("campaigns.subMenus.listContacts")}
                        arrow
                        color="#000"
                        placement="top"
                      >
                        <MenuButton>
                          <PeopleIcon
                            color="inherit"
                            style={{
                              color: "#000",
                              width: 30,
                              height: 30,
                            }}
                          />
                        </MenuButton>
                      </Tooltip>
                    </ListItemIcon>
                    {/* <ListItemText primary={i18n.t("campaigns.subMenus.listContacts")} /> */}
                  </ListItem>
                  <ListItem
                    onClick={() => history.push("/campaigns-config")}
                    button
                  >
                    <ListItemIcon>
                      <Tooltip
                        title={i18n.t("campaigns.subMenus.settings")}
                        arrow
                        color="#000"
                        placement="top"
                      >
                        <MenuButton>
                          <SettingsOutlinedIcon
                            color="inherit"
                            style={{
                              color: "#000",
                              width: 30,
                              height: 30,
                            }}
                          />
                        </MenuButton>
                      </Tooltip>
                    </ListItemIcon>
                    {/* <ListItemText primary={i18n.t("campaigns.subMenus.settings")} /> */}
                  </ListItem>
                </List>
              </Collapse>
            </>
          )}
        </div>
      </MainHeader>
      <Paper className={classes.mainPaper} elevation={1}>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          onChange={handleTabChange}
          className={classes.tab}
        >
          <Tab label={i18n.t("settings.tabs.options")} value={"options"} />
          {schedulesEnabled && <Tab label="Horários" value={"schedules"} />}
          {isSuper() ? <Tab label={i18n.t("settings.tabs.companies")} value={"companies"} /> : null}
          {isSuper() ? (
            <Tab label={i18n.t("settings.tabs.plans")} value={"plans"} />
          ) : null}
          {isSuper() ? (
            <Tab label={i18n.t("settings.tabs.helps")} value={"helps"} />
          ) : null}
        </Tabs>
        <Paper className={classes.paper} elevation={0}>
          <TabPanel
            className={classes.container}
            value={tab}
            name={"schedules"}
          >
            <SchedulesForm
              loading={loading}
              onSubmit={handleSubmitSchedules}
              initialValues={schedules}
            />
          </TabPanel>
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel
                className={classes.container}
                value={tab}
                name={"companies"}
              >
                <CompaniesManager />
              </TabPanel>
            )}
          />
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel
                className={classes.container}
                value={tab}
                name={"plans"}
              >
                <PlansManager />
              </TabPanel>
            )}
          />
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel
                className={classes.container}
                value={tab}
                name={"helps"}
              >
                <HelpsManager />
              </TabPanel>
            )}
          />
          <TabPanel className={classes.container} value={tab} name={"options"}>
            <Options
              settings={settings}
              oldSettings={oldSettings}
              user={currentUser}
              scheduleTypeChanged={(value) =>
                setSchedulesEnabled(value === "company")
              }
            />
          </TabPanel>
        </Paper>
      </Paper>
    </MainContainer>
  );
};

export default SettingsCustom;
