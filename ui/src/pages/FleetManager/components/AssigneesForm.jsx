import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';

import { Modal, OfficerSearch } from '../../../components';

const useStyles = makeStyles((theme) => ({
  editorField: {
    marginBottom: 10,
  },
}));

export default ({ open, existing = null, onSubmit, onClose }) => {
  const classes = useStyles();
  const myJob = useSelector((state) => state.app.govJob);

  const [officers, setOfficers] = useState([]);
  const [searchInput, setInput] = useState('');
  const [assigned, setAssigned] = useState([]);

  useEffect(() => {
    if (open) {
      setAssigned(existing && existing.length > 0 ? existing : []);
      setInput('');
      setOfficers([]);
    }
  }, [open, existing]);

  const internalSubmit = (e) => {
    e.preventDefault();
    onSubmit(assigned);
    setInput('');
    setOfficers([]);
  };

  const internalClose = () => {
    setAssigned(existing && existing.length > 0 ? existing : []);
    setInput('');
    setOfficers([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      maxWidth="sm"
      title="Manage Assigned Drivers"
      submitLang="Update"
      onSubmit={internalSubmit}
      onClose={internalClose}
    >
      <OfficerSearch
        job={myJob.Id}
        label="Assigned Drivers"
        value={assigned}
        inputValue={searchInput}
        options={officers}
        setOptions={setOfficers}
        onChange={(e, nv) => {
          setAssigned(nv.length === 0 ? [] : nv);
          setInput('');
        }}
        onInputChange={(e, nv) => setInput(nv)}
      />
    </Modal>
  );
};
