/** @format */

import React, { useState, useEffect, useMemo } from "react";

import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import LogItem from "./LogItem";
import ReactTable from "./ReactTable";
import AddLogItem from "./AddLogItem";
import { ipcRenderer, ipcMain } from "electron";
import Button from "react-bootstrap/Button";
import { Col, Form, Row } from "react-bootstrap";
import useLocalStorage from "../service/useLocalStorage";
import { Files, View } from "../config/consts";

import makeData from "../service/dataGenerator";
import Select from "react-select";

const App = () => {
  const [logs, setLogs] = useState([]);
   const [dataSet, setDataSet] = useState([]);
   const [displayType, setDisplayType] = useState();

   const [filtered, setFiltered] = useState([]);
   const [select2, setSelect2] = useState();

   const [alert, setAlert] = useState({
     show: false,
     message: "",
     variant: "success",
   });

   const [storedDirectoryToScan, setStoredDirectoryToScan] = useLocalStorage(
     "BDDStepBrowser",
     Files.DefaultPathToScan
   );

   const onFilteredChangeCustom = (value, accessor) => {
     let insertNewFilter = 1;
     console.log("val ", value);
     console.log("accessor ", accessor);
     if (filtered.length) {
       filtered.forEach((filter, i) => {
         if (filter["id"] === accessor) {
           if (value === "" || !value.length) filtered.splice(i, 1);
           else filter["value"] = value;

           insertNewFilter = 0;
         }
       });
     }

     if (insertNewFilter) {
       filtered.push({ id: accessor, value: value });
     }
     setFiltered(filtered);
   };

   useEffect(() => {
     ipcRenderer.send("logs:load");

     ipcRenderer.on("logs:get", (e, logs) => {
       setLogs(JSON.parse(logs));
     });

     ipcRenderer.on("logs:clear", () => {
       setLogs([]);
       showAlert("Logs Cleared");
     });
     ipcRenderer.on("directory:set", (e, directory) => {
       console.log(`selected diiir ${directory}`);
       setStoredDirectoryToScan(JSON.parse(directory));
     });
     ipcRenderer.on("features:get", (e, features) => {
       console.log(`Parsed Feature send:`);
       setDataSet(JSON.parse(features));
     });
   }, []);

   useEffect(() => {
     if (
       storedDirectoryToScan &&
       Files.DefaultPathToScan !== storedDirectoryToScan
     ) {
       console.log(`getting root dir: ${storedDirectoryToScan}`);
       ipcRenderer.send("files:get", storedDirectoryToScan);
     }
   }, [storedDirectoryToScan]);

   function addItem(item) {
     if (item.text === "" || item.user === "" || item.priority === "") {
       showAlert("Please enter all fields", "danger");
       return false;
     }

     // item._id = Math.floor(Math.random() * 90000) + 10000
     // item.created = new Date().toString()
     // setLogs([...logs, item])

     ipcRenderer.send("logs:add", item);

     showAlert("Log Added");
   }

   function deleteItem(_id) {
     // setLogs(logs.filter((item) => item._id !== _id))
     ipcRenderer.send("logs:delete", _id);
     showAlert("Log Removed");
   }

   function showAlert(message, variant = "success", seconds = 3000) {
     setAlert({
       show: true,
       message,
       variant,
     });

     setTimeout(() => {
       setAlert({
         show: false,
         message: "",
         variant: "success",
       });
     }, seconds);
   }

   function handleOpenDirDialog() {
     ipcRenderer.send("openDir");
   }

   const columns = React.useMemo(
     () => [
       {
         Header: "Name",
         columns: [
           {
             Header: "Feature Name",
             accessor: "featureName",
           },
           {
             Header: "Feature Path",
             accessor: "featurePath",
             // filter: "fuzzyText",
           },
         ],
       },
       {
         Header: "Info",
         columns: [
           {
             Header: "Number of Scenarios",
             accessor: "scenarioNum",
           },
           {
             Header: "Tags",
             accessor: "tags",
           },
         ],
       },
     ],
     []
   );

   const data = React.useMemo(() => makeData(200), []);
   console.log(`Data: ${JSON.stringify(data)}`);

   return (
     <Container>
       <AddLogItem addItem={addItem} />
       {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
       <Row>
         <Col xs={4}>
           <Button variant='danger' size='sm' onClick={handleOpenDirDialog}>
             Scan Directory
           </Button>
         </Col>
         <Col xs={8}>
           <Form.Control
             type='text'
             id='inputPassword5'
             aria-describedby='passwordHelpBlock'
             value={storedDirectoryToScan}
             disabled
           />
         </Col>
       </Row>
       <Row>
         <Col xs={3}>
           <Form.Group controlId='formBasicSelect'>
             <Form.Label>Select View</Form.Label>
             <Form.Control
               as='select'
               value={displayType}
               onChange={(e) => {
                 console.log("e.target.value", e.target.value);
                 setDisplayType(e.target.value);
               }}
             >
               <option value={View.Feature}>{View.Feature}</option>
               <option value={View.Scenario}>{View.Scenario}</option>
               <option value={View.Step}>{View.Step}</option>
             </Form.Control>
           </Form.Group>
         </Col>
       </Row>
       <ReactTable columns={columns} data={dataSet} />
       <Table>
         <thead>
           <tr>
             <th>Priority</th>
             <th>Log Text</th>
             <th>User</th>
             <th>Created</th>
             <th></th>
           </tr>
         </thead>
         <tbody>
           {logs.map((log) => (
             <LogItem key={log._id} log={log} deleteItem={deleteItem} />
           ))}
         </tbody>
       </Table>
     </Container>
   );
};

export default App;
