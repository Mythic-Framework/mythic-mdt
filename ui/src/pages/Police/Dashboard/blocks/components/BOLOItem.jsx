import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Moment from "react-moment";
const Truncate = ({ lines, children }) => <span style={{ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>;

import { Modal } from "../../../../../components";
import { BOLOTypes } from "../../../Create/BOLO";
import { Sanitize } from "../../../../../util/Parser";
import Nui from "../../../../../util/Nui";
import { usePerson } from '../../../../../hooks';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    userSelect: 'none',
    borderLeft: '3px solid transparent',
    transition: 'background ease-in 0.15s, border-color ease-in 0.15s',
    '&:hover': {
      cursor: 'pointer',
      background: `${theme.palette.primary.main}0f`,
      borderLeftColor: `${theme.palette.primary.main}60`,
    },
  },
  time: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    whiteSpace: 'nowrap',
    marginLeft: 8,
  },
  officerLink: {
    color: 'rgba(255,255,255,0.45)',
    transition: 'color ease-in 0.15s',
    '&:hover': {
      color: theme.palette.primary.main,
    },
    '&:not(:last-of-type)': {
      content: '", "',
      color: 'rgba(255,255,255,0.6)',
    },
  },
}));

export default ({ bolo }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const formatPerson = usePerson();

  const [open, setOpen] = useState(false);

  const onDismiss = async () => {
    try {
      let res = await (
        await Nui.send("Delete", {
          type: "BOLO",
          id: bolo._id,
        })
      ).json();

      if (res) {
        dispatch({
          type: "REMOVE_DATA",
          payload: {
            type: "bolos",
            id: bolo._id,
          },
        });
        toast.success("BOLO Dismissed");
      } else toast.error("Unable to Dismiss BOLO");
    } catch (err) {
      console.log(err);
      toast.error("Unable to Dismiss BOLO");
    }
    setOpen(false);
  };

  return (
    <>
      <ListItem className={classes.wrapper} onClick={() => setOpen(true)}>
        <ListItemAvatar>
          <Avatar>
            <FontAwesomeIcon icon={["fas", bolo.type]} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<Truncate lines={1}>{bolo.title}</Truncate>}
          secondary={<Truncate lines={1}>{bolo.summary}</Truncate>}
        />
        <Moment className={classes.time} date={bolo.time} fromNow />
      </ListItem>
      <Modal
        open={open}
        title={bolo.title}
        deleteLang="Dismiss BOLO"
        onClose={() => setOpen(false)}
        onDelete={onDismiss}
      >
        <List className={classes.author}>
          <ListItem>
            <ListItemText
              primary="Issuing Officer"
              secondary={
                <Link
                  className={classes.officerLink}
                  to={`/roster?id=${bolo.author.SID}`}
                >{formatPerson(bolo.author.First, bolo.author.Last, bolo.author.Callsign, bolo.author.SID)}</Link>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Type"
              secondary={
                BOLOTypes.filter((b) => b.value == bolo.type)[0]?.label
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Summary" secondary={bolo.summary} />
          </ListItem>
          <ListItem>
            <ListItemText
              style={{ whiteSpace: "pre-line" }}
              primary="Description"
              secondary={<span>{Sanitize(bolo.description)}</span>}
            />
          </ListItem>
        </List>
      </Modal>
    </>
  );
};
