import React, { useEffect,createRef } from "react";
//import Header from "../layout/header";
import { useLocation, useNavigate } from "react-router-dom";
import {blobToBase64,base64ToBlob} from "../../../Utils/fileutil"  
import { Button } from "@mui/material";
import { UploadFile, DownloadFile, simulateMyInspection,getInspectionsById } from "../../../REST/inspections";
import { useState } from "react";

const EditInspection = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.pathname.toLowerCase().replace("/inspection/editinspection/","")
  const user = JSON.parse(sessionStorage.user)
  const [schema,setSchema] = useState(null)   
  const iframeRef = createRef()
  const formjsurl = window.location.origin+"/forms/simulate.html"

  useEffect(() => {
    getInspectionsById(id)
    .then((res)=>{
         const data = res?.data?.formData
         let schema = data?.schema
         schema.components.push({
          "action": "submit",
          "key": "submit",
          "label": "Submit",
          "type": "button",
          "id": "submitform"
        })
        setSchema(schema)     
     }
    )
    .catch((e)=>{ debugger; navigate("/inspection") })
  }, []);

  const listenToForm = (e)=>{
    if(e.data && e.data.source && e.data.source == "formjs")
    {
      onSubmit(e.data.formData)
    }				
    
  } 
  useEffect(() => {
		
    window.addEventListener("message",listenToForm)
  }, []);
 
  useEffect(() => {
       return () => {
           window.removeEventListener("message",listenToForm);

       }
   }, [])
 /**/
   
  const showForm = ()=>{
    window.schema = schema
    iframeRef.current.contentWindow.postMessage(schema, '*');

  }
  

  const uploadFileData = (data)=>{
    let promises = []
    window.schema.components.forEach(element => {
      if(element.type == "fileupload" && data[element.key])
      {
        promises.push( () =>{
            return new Promise((resolve, reject) => {
              const {file,type} = base64ToBlob(data[element.key])
              const formData = new FormData()
              
              formData.append('file', file)
              formData.append('type', type)
              UploadFile(formData)
              .then((res)=>{
                  data[element.key] = res.data.awsid
                  resolve();
              })
              .catch(()=>{ reject() })
            }) 
        } )
      }
    });
    return Promise.all(promises.map((x)=>{ return x(); }) )
  }
  const onSubmit = (data) => {
    
    document.getElementById('formiframe').style.display = 'none'
    uploadFileData(data)
    .then(()=>{
      let record = {
        myData : {...data,createdDate:new Date().toISOString(),createdBy:user.given_name},
        inspectionId:id
      }
       
      return simulateMyInspection(record)
    }) 
    .then(()=>{
      navigate("/inspection/inspectionList/"+id);

    })
    .catch((err) => {
      navigate("/inspection");
    })
      
  }

  if(schema != null)
  {
    return (
      <iframe id="formiframe" ref={iframeRef} src={formjsurl} 
          style={{position: "fixed",top:"67px",bottom:"0px",right:"0px",width:"100%",
					border:"none",margin:"0",padding:"0", height:'calc(100% - 67px)',zIndex:999}}
					onLoad={showForm}>
		   </iframe>
    )
  }
  return (
    <></>
  );
};

export default EditInspection;
