import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  TextField,
  InputAdornment,
  IconButton,
  List,
  Grid,
  Paper,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Nui from '../../util/Nui';
import { Loader } from '../../components';
import Item from './components/Vehicle';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: 10,
    height: '100%',
  },
  paper: {
    height: '100%',
    maxHeight: '100%',
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 5px 10px 5px',
    height: '100%',
  },
  results: {
    flexGrow: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
    maxHeight: '100%',
  },
}));

export default () => {
  const classes = useStyles();

  const [searched, setSearched] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    setLoading(true);
    try {
      let res = await (await Nui.send('ViewVehicleFleet', {})).json();
      if (res) setResults(res);
      else setErr(true);
    } catch (err) {
      console.log(err);
      setErr(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    setFiltered(
      results.filter((r) => {
        return (
          r.VIN.toLowerCase().includes(searched.toLowerCase()) ||
          (r.RegisteredPlate &&
            r.RegisteredPlate.toLowerCase().includes(searched.toLowerCase())) ||
          `${r.Make} ${r.Model}`.toLowerCase().includes(searched.toLowerCase())
        );
      }),
    );
  }, [results, searched]);

  const onClear = () => setSearched('');

  return (
    <div className={classes.wrapper}>
      <Grid container style={{ height: '100%' }}>
        <Grid item xs={12} style={{ height: '100%' }}>
          <Paper elevation={3} className={classes.paper}>
            {loading ? (
              <Loader static text="Loading" />
            ) : (
              <div className={classes.inner}>
                <div>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="standard"
                        name="search"
                        value={searched}
                        onChange={(e) => setSearched(e.target.value)}
                        error={err}
                        helperText={err ? 'Error Loading Fleet' : null}
                        label="Search By Plate, VIN or Make/Model"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {searched !== '' && (
                                <IconButton type="button" onClick={onClear}>
                                  <FontAwesomeIcon icon={['fas', 'xmark']} />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </div>
                <div className={classes.results}>
                  <List>
                    {filtered
                      .sort((a, b) => a.RegistrationDate - b.RegistrationDate)
                      .map((result) => (
                        <Item key={result.VIN} vehicle={result} />
                      ))}
                  </List>
                </div>
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};
