import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import SearchIcon from "@material-ui/icons/Search";
import {
  Add,
  ClearAllRounded,
  DoneAll,
  Facebook,
  Add as AddIcon,
  Group,
  Instagram,
  OfflineBolt,
  WhatsApp,
  TextRotateUp,
  TextRotationDown,
} from "@material-ui/icons";
import {
  FilterAltOff,
  FilterAlt,
  PlaylistAddCheckOutlined,
} from "@mui/icons-material";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import MessageSharpIcon from "@material-ui/icons/MessageSharp";
import ClockIcon from "@material-ui/icons/AccessTime";
import IconButton from "@material-ui/core/IconButton";

import FilterListIcon from "@material-ui/icons/FilterList";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { useTheme } from "@material-ui/core/styles";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
import { StatusFilter } from "../StatusFilter";
import { WhatsappsFilter } from "../WhatsappsFilter";
import api from "../../services/api";
import { Button, Snackbar, Tooltip } from "@material-ui/core";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import { QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: "none",
    // backgroundColor: "#eee",
    backgroundColor: theme.palette.tabHeaderBackground,
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tab: {
    minWidth: 120,
    width: 120,
  },

  snackbar: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    borderRadius: 30,
  },

  yesButton: {
    backgroundColor: "#FFF",
    color: "rgba(0, 100, 0, 1)",
    padding: "4px 4px",
    fontSize: "1em",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginRight: theme.spacing(1),
    "&:hover": {
      backgroundColor: "darkGreen",
      color: "#FFF",
    },
    borderRadius: 30,
  },
  noButton: {
    backgroundColor: "#FFF",
    color: "rgba(139, 0, 0, 1)",
    padding: "4px 4px",
    fontSize: "1em",
    fontWeight: "bold",
    textTransform: "uppercase",
    "&:hover": {
      backgroundColor: "darkRed",
      color: "#FFF",
    },
    borderRadius: 30,
  },
  tabsBadge: {
    top: "105%",
    right: "55%",
    transform: "translate(45%, 0)",
    whiteSpace: "nowrap",
    borderRadius: "12px",
    padding: "0 8px",
    backgroundColor:
      theme.mode === "light" ? theme.palette.primary.main : "#FFF",
    color: theme.mode === "light" ? "#FFF" : theme.palette.primary.main,
  },

  tabPanelItem: {
    minWidth: 120,
    fontSize: 11,
    marginLeft: 0,
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // background: "#fafafa",
    background: theme.palette.optionsBackground,
    borderRadius: 8,
    borderColor: "#aaa",
    borderWidth: "1px",
    borderStyle: "solid",
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.5),
  },

  serachInputWrapper: {
    flex: 1,
    // background: "#fff",
    height: 40,
    background: theme.palette.total,
    display: "flex",
    borderRadius: 40,
    padding: 4,
    borderColor: "#aaa",
    borderWidth: "1px",
    borderStyle: "solid",
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },

  searchIcon: {
    color: "grey",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 30,
  },

  badge: {
    // right: "-10px",
  },
  closeAllFab: {
    backgroundColor: "red",
    marginBottom: "4px",
    "&:hover": {
      backgroundColor: "darkred",
    },
  },

  customBadge: {
    right: "-10px",
    backgroundColor: "#f44336",
    color: "#fff",
  },

  show: {
    display: "block",
  },

  hide: {
    display: "none !important",
  },

  speedDial: {
    position: "absolute",
    bottom: theme.spacing(1),
    right: theme.spacing(1),
  },
  button: {
    height: 30,
    width: 30,
    border: "2px solid",
    borderColor: "#aaa",
    borderRadius: 8,
    marginRight: 8,
    "&:hover": {
      borderColor: theme.mode === "light" ? theme.palette.primary.main : "#FFF",
    },
  },
  icon: {
    color: "#aaa",
    "&:hover": {
      color: theme.mode === "light" ? theme.palette.primary.main : "#FFF",
    },
  },
  buttonOpen: {
    "& $icon": {
      color: theme.mode === "light" ? theme.palette.primary.main : "#FFF",
    },
  },
}));

const TicketsManagerTabs = () => {
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;
  const theme = useTheme();
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupingCount, setGroupingCount] = useState(0);
  const [sortTickets, setSortTickets] = useState(false);
  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [searchOnMessages, setSearchOnMessages] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  // const [forceSearch, setForceSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [filter, setFilter] = useState(false);
  // const [open, setOpen] = useState(false);
  // const [hidden, setHidden] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isHoveredAll, setIsHoveredAll] = useState(false);
  const [isHoveredNew, setIsHoveredNew] = useState(false);
  const [isHoveredResolve, setIsHoveredResolve] = useState(false);
  const [isHoveredOpen, setIsHoveredOpen] = useState(false);
  const [isHoveredClosed, setIsHoveredClosed] = useState(false);
  const [isHoveredSort, setIsHoveredSort] = useState(false);
  const { setSelectedQueuesMessage } = useContext(QueueSelectedContext);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedQueuesMessage(selectedQueueIds);
  }, []);
  // }, [selectedQueueIds]);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
    // setForceSearch(!forceSearch)
  }, []);

  useEffect(() => {
    if (tab !== "search") {
      setFilter(false)
    }
    // setForceSearch(!forceSearch)
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      //setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  // const handleBack = useCallback(() => {
  //   history.push("/tickets");
  // },[history]);

  const handleSnackbarOpen = useCallback(() => {
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const CloseAllTicket = async () => {
    try {
      const { data } = await api.post("/tickets/closeAll", {
        status: tabOpen,
        queueIds: selectedQueueIds,
      });
      handleSnackbarClose();
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  // const handleVisibility = () => {
  //   setHidden((prevHidden) => !prevHidden);
  // };

  // const handleOpen = () => {
  //   setOpen(true);
  // };

  // const handleClosed = () => {
  //   setOpen(false);
  // };

  const tooltipTitleStyle = {
    fontSize: "10px",
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    setSelectedWhatsapp(whatsapp);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);

    setSelectedStatus(statusFilter);
  };

  const handleFilter = () => {   
    if (filter) {
      setFilter(false);
      setSearchParam("")
      setTab("open");
    } else {
      setFilter(true);
      setTab("search");
    }
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={i18n.t("ticketsManager.questionCloseTicket")}
        ContentProps={{
          className: classes.snackbar,
        }}
        action={
          <>
            <Button
              className={classes.yesButton}
              size="small"
              onClick={CloseAllTicket}
            >
              {i18n.t("ticketsManager.yes")}
            </Button>
            <Button
              className={classes.noButton}
              size="small"
              onClick={handleSnackbarClose}
            >
              {i18n.t("ticketsManager.not")}
            </Button>
          </>
        }
      />

      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      {/* <div className={classes.serachInputWrapper}>
        <SearchIcon className={classes.searchIcon} />
        <InputBase
          className={classes.searchInput}
          inputRef={searchInputRef}
          placeholder={i18n.t("tickets.search.placeholder")}
          type="search"
          onChange={handleSearch}
        />
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="span"
          onClick={handleFilter}
        >
          <FilterListIcon />
        </IconButton>
      </div> */}

      {filter === true && (
        <>
          <TagsFilter onFiltered={handleSelectedTags} />
          <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
          <StatusFilter onFiltered={handleSelectedStatus} />
          {profile === "admin" && (
            <>
              <UsersFilter onFiltered={handleSelectedUsers} />
            </>
          )}
        </>
      )}

      {/* <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            icon={<MoveToInboxIcon />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<CheckBoxIcon />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"search"}
            icon={<SearchIcon />}
            label={i18n.t("tickets.tabs.search.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper> */}
      <div className={classes.serachInputWrapper}>
        <SearchIcon className={classes.searchIcon} />
        <InputBase
          className={classes.searchInput}
          inputRef={searchInputRef}
          placeholder={i18n.t("tickets.search.placeholder")}
          type="search"
          disabled={!filter}
          onChange={handleSearch}
        />
        <Tooltip
          placement="top"
          title="Marque para pesquisar também nos conteúdos das mensagens (mais lento)"
        >
          <div>
            <Switch
              size="small"
              checked={searchOnMessages}
              onChange={(e) => {
                setSearchOnMessages(e.target.checked);
              }}
            />
          </div>
        </Tooltip>
        {/* <IconButton
          className={classes.filterIcon}
          color="primary"
          aria-label="upload picture"
          component="span"
          onClick={handleFilter}
        >
          <FilterListIcon />
        </IconButton> */}
        {/* <FilterListIcon
          className={classes.filterIcon}
          color="primary"
          aria-label="upload picture"
          component="span"
          onClick={handleFilter}
        /> */}
        <IconButton
          style={{
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "none",
            borderRadius: "50%",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          variant="contained"
          aria-label="filter"
          className={classes.filterIcon}
          onClick={() => {
            setIsFilterActive((prevState) => !prevState);
            handleFilter();
          }}
        >
          {isFilterActive ? (
            <FilterAlt className={classes.icon} />
          ) : (
            <FilterAltOff className={classes.icon} />
          )}
        </IconButton>
      </div>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Can
              role={
                user.allUserChat === "enabled" && user.profile === "user"
                  ? "admin"
                  : user.profile
              }
              perform="tickets-manager:showall"
              yes={() => (
                <Badge
                  color="primary"
                  invisible={
                    !isHoveredAll ||
                    isHoveredNew ||
                    isHoveredResolve ||
                    isHoveredOpen ||
                    isHoveredClosed
                  }
                  badgeContent={i18n.t("ticketsManager.buttons.all")}
                  classes={{ badge: classes.tabsBadge }}
                >
                  <ToggleButton
                    onMouseEnter={() => setIsHoveredAll(true)}
                    onMouseLeave={() => setIsHoveredAll(false)}
                    className={classes.button}
                    value="uncheck"
                    selected={showAllTickets}
                    onChange={() =>
                      setShowAllTickets((prevState) => !prevState)
                    }
                  >
                    {showAllTickets ? (
                      <VisibilityIcon className={classes.icon} />
                    ) : (
                      <VisibilityOffIcon className={classes.icon} />
                    )}
                  </ToggleButton>
                </Badge>
              )}
            />

            <Badge
              color="primary"
              invisible={
                isHoveredAll ||
                !isHoveredNew ||
                isHoveredResolve ||
                isHoveredOpen ||
                isHoveredClosed
              }
              badgeContent={i18n.t("ticketsManager.buttons.newTicket")}
              classes={{ badge: classes.tabsBadge }}
            >
              <IconButton
                onMouseEnter={() => setIsHoveredNew(true)}
                onMouseLeave={() => setIsHoveredNew(false)}
                className={classes.button}
                onClick={() => {
                  setNewTicketModalOpen(true);
                }}
              >
                <AddIcon className={classes.icon} />
              </IconButton>
            </Badge>
            {user.profile === "admin" && (
              <Badge
                color="primary"
                invisible={
                  isHoveredAll ||
                  isHoveredNew ||
                  !isHoveredResolve ||
                  isHoveredOpen ||
                  isHoveredClosed
                }
                badgeContent={i18n.t("ticketsManager.buttons.closedAll")}
                classes={{ badge: classes.tabsBadge }}
              >
                <IconButton
                  onMouseEnter={() => setIsHoveredResolve(true)}
                  onMouseLeave={() => setIsHoveredResolve(false)}
                  className={classes.button}
                  onClick={handleSnackbarOpen}
                >
                  <PlaylistAddCheckOutlined
                    style={{ color: theme.mode === "light" ? "green" : "#FFF" }}
                  />
                </IconButton>
              </Badge>
            )}
            <Badge
              // color="primary"
              invisible={
                !(
                  tab === "open" &&
                  !isHoveredAll &&
                  !isHoveredNew &&
                  !isHoveredResolve &&
                  !isHoveredClosed &&
                  !isHoveredSort
                ) && !isHoveredOpen
              }
              badgeContent={i18n.t("ticketsManager.buttons.open")}
              classes={{ badge: classes.tabsBadge }}
            >
              <IconButton
                onMouseEnter={() => {
                  setIsHoveredOpen(true);
                  setHoveredButton("open");
                }}
                onMouseLeave={() => {
                  setIsHoveredOpen(false);
                  setHoveredButton(null);
                }}
                style={{
                  height: 30,
                  width: 30,
                  border: isHoveredOpen
                    ? theme.mode === "light"
                      ? "3px solid " + theme.palette.primary.main
                      : "3px solid #FFF"
                    : tab === "open"
                    ? theme.mode === "light"
                      ? "3px solid " + theme.palette.primary.main
                      : "3px solid #FFF"
                    : theme.mode === "light"
                    ? "2px solid #aaa"
                    : "2px solid #aaa",
                  borderRadius: 8,
                  marginRight: 8,
                }}
                onClick={() => handleChangeTab(null, "open")}
              >
                <MoveToInboxIcon
                  style={{
                    color: isHoveredOpen
                      ? theme.mode === "light"
                        ? theme.palette.primary.main
                        : "#FFF"
                      : tab === "open"
                      ? theme.mode === "light"
                        ? theme.palette.primary.main
                        : "#FFF"
                      : "#aaa",
                  }}
                />
              </IconButton>
            </Badge>

            <Badge
              color="primary"
              invisible={
                !(
                  tab === "closed" &&
                  !isHoveredAll &&
                  !isHoveredNew &&
                  !isHoveredResolve &&
                  !isHoveredOpen &&
                  !isHoveredSort
                ) && !isHoveredClosed
              }
              badgeContent={i18n.t("ticketsManager.buttons.resolverd")}
              classes={{ badge: classes.tabsBadge }}
            >
              <IconButton
                onMouseEnter={() => {
                  setIsHoveredClosed(true);
                  setHoveredButton("closed");
                }}
                onMouseLeave={() => {
                  setIsHoveredClosed(false);
                  setHoveredButton(null);
                }}
                style={{
                  height: 30,
                  width: 30,
                  border: isHoveredClosed
                    ? theme.mode === "light"
                      ? "3px solid " + theme.palette.primary.main
                      : "3px solid #FFF"
                    : tab === "closed"
                    ? theme.mode === "light"
                      ? "3px solid " + theme.palette.primary.main
                      : "3px solid #FFF"
                    : theme.mode === "light"
                    ? "2px solid #aaa"
                    : "2px solid #aaa",
                  borderRadius: 8,
                  marginRight: 8,
                }}
                onClick={() => handleChangeTab(null, "closed")}
              >
                <CheckBoxIcon
                  style={{
                    color: isHoveredClosed
                      ? theme.mode === "light"
                        ? theme.palette.primary.main
                        : "#FFF"
                      : tab === "closed"
                      ? theme.mode === "light"
                        ? theme.palette.primary.main
                        : "#FFF"
                      : "#aaa",
                  }}
                />
              </IconButton>
            </Badge>
            {/* {tab !== "closed" && tab !== "search" && (
              <Badge
                color="primary"
                invisible={
                  !isHoveredSort ||
                  isHoveredAll ||
                  isHoveredNew ||
                  isHoveredResolve ||
                  isHoveredOpen ||
                  isHoveredClosed
                }
                badgeContent={
                  !sortTickets
                    ? i18n.t("ticketsManager.buttons.asc")
                    : i18n.t("ticketsManager.buttons.desc")
                }
                classes={{ badge: classes.tabsBadge }}
              >
                <ToggleButton
                  onMouseEnter={() => setIsHoveredSort(true)}
                  onMouseLeave={() => setIsHoveredSort(false)}
                  className={classes.button}
                  value="uncheck"
                  selected={sortTickets}
                  onChange={() => setSortTickets((prevState) => !prevState)}
                >
                  {!sortTickets ? (
                    <TextRotateUp
                      style={{
                        color: sortTickets
                          ? theme.mode === "light"
                            ? theme.palette.primary.main
                            : "#FFF"
                          : "#aaa",
                      }}
                    />
                  ) : (
                    <TextRotationDown
                      style={{
                        color: sortTickets
                          ? theme.mode === "light"
                            ? theme.palette.primary.main
                            : "#FFF"
                          : "#aaa",
                      }}
                    />
                  )}
                </ToggleButton>
              </Badge>
            )} */}
          </Grid>
          <Grid item>
            <TicketsQueueSelect
              selectedQueueIds={selectedQueueIds}
              userQueues={user?.queues}
              onChange={(values) => setSelectedQueueIds(values)}
            />
          </Grid>
        </Grid>
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {/* ATENDENDO */}
          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    className={classes.badge}
                    badgeContent={openCount}
                    color="primary"
                  >
                    <MessageSharpIcon
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.assignedHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"open"}
            classes={{ root: classes.tabPanelItem }}
          />

          {/* AGUARDANDO */}
          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    classes={{ badge: classes.customBadge }}
                    badgeContent={pendingCount}
                    color="primary"
                  >
                    <ClockIcon
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.pendingHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"pending"}
            classes={{ root: classes.tabPanelItem }}
          />

          {/* GRUPOS */}
          <Tab
            label={
              <Grid container alignItems="center" justifyContent="center">
                <Grid item>
                  <Badge
                    overlap="rectangular"
                    classes={{ badge: classes.customBadge }}
                    badgeContent={groupingCount}
                    color="primary"
                  >
                    <Group
                      style={{
                        fontSize: 18,
                      }}
                    />
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i18n.t("ticketsList.groupingHeader")}
                  </Typography>
                </Grid>
              </Grid>
            }
            value={"group"}
            classes={{ root: classes.tabPanelItem }}
          />
        </Tabs>

        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
            forceSearch={false}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            showAll={user.profile === "admin" ? showAllTickets : false}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
            forceSearch={false}
          />
          <TicketsList
            status="group"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setGroupingCount(val)}
            style={applyPanelStyle("group")}
            forceSearch={false}
          />
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          // handleChangeTab={handleChangeTabOpen}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        {profile === "admin" && (
          <>
            <TicketsList
              statusFilter={selectedStatus}
              searchParam={searchParam}
              showAll={showAllTickets}
              tags={selectedTags}
              users={selectedUsers}
              selectedQueueIds={selectedQueueIds}
              whatsappIds={selectedWhatsapp}
              forceSearch={true}
              status="search"
            />
          </>
        )}

        {profile === "user" && (
          <TicketsList
            statusFilter={selectedStatus}
            searchParam={searchParam}
            showAll={false}
            tags={selectedTags}
            selectedQueueIds={selectedQueueIds}
            whatsappIds={selectedWhatsapp}
            forceSearch={true}
            status="search"
          />
        )}
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
