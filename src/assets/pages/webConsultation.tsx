import { useEffect, useRef, useState } from 'react'
import ClipLoader from "react-spinners/ClipLoader";
import { getFirebase, getSavedFireStore } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAnalytics } from 'firebase/analytics';
import axios from 'axios';
import firebase from 'firebase/compat/app';
import AgoraView from '../../component/agoraView';

type Props = {}

export default function WebConsultation({}: Props) {

    const [callDataOne, setCallDataOne] = useState<any>(null);
    const [email, setEmail] = useState<any>("");
    const [isLoading, setIsLoading] = useState(true);
    const [agoraData, setAgoraData] = useState({
        RTCChannel: '',
        RTCAccessToken: ''
    });
    const params: any = useParams();
    const trackerRef = useRef(0);

    const init = async ()=>{
        // check if event exist on firebase

        const callData = await getDoc(doc(getSavedFireStore(), "web-call-holder", params.callId));

        if(!callData.exists()){
            toast.error("Call not found");
            return ;
        }

        const __ : any = {
            ...callData.data(),
            data: JSON.parse(callData.data()?.data || {})
        };

        setCallDataOne(__);
        

        // get user info
        const userEmail = window.prompt("Please enter your email");
        if( 
            !(__.doctorEmail?.toLowerCase() == userEmail?.toLowerCase() ||
            __.patientEmail?.toLowerCase() == userEmail?.toLowerCase()
             )){
                 toast.error("You're not authorize to be on this call");
                 return ;
        }

        // let's init call n send push notification

        if(__.token && __.channel){
            agoraInit(__.channel, __.token)
        }else{
            callInit(__)
        }
    }

    const callInit = async(__callData: any)=>{
        try{
            let res = await axios.get('https://api.clarondoc.com/urgent/token')
            agoraInit(res.data.RTCChannel, res.data.RTCAccessToken)

            // update this specific call data
            await updateDoc(doc(getSavedFireStore(), "web-call-holder", __callData.callId), {
                channel: res.data.RTCChannel,
                token: res.data.RTCAccessToken
            });

            await updateDoc(doc(getSavedFireStore(), "normal_calls", __callData.patientEmail), {
                data: {
                    time: new Date(),
                    patient: __callData.patientEmail,
                    doctor: __callData.doctorEmail,
                    caller: `Scheduled Appointment`,
                    status: 'started',
                    end_now: 'false',
                    channel: res.data.RTCChannel,
                    token: res.data.RTCAccessToken
                }
            });
    
            // await firebase.firestore().collection('normal_calls').doc(__callData.patientEmail).set({data: {
            //   time: new Date(),
            //   patient: __callData.patientEmail,
            //   doctor: __callData.doctorEmail,
            //   caller: `Scheduled Appointment`,
            //   status: 'started',
            //   end_now: 'false',
            //   channel: res.data.RTCChannel,
            //   token: res.data.RTCAccessToken
            // }})
    
            // send require to other device if in background
          // start
        //   firebase.firestore().collection('device_token').doc(__callData.patientEmail).get().then(snapshot=>{
            getDoc(doc(getSavedFireStore(), "device_token", __callData.patientEmail)).then(snapshot=>{
            console.log('Docs: ', snapshot.data())
            let data: any = snapshot.data();
            if(data.token != undefined){
             
    
              axios.post('https://fcm.googleapis.com/fcm/send', {
                "to": data.token,
                "notification": {
                  "title": "Incoming Call Request",
                  "sound": "ring.mp3",
                  "body": "Click to open app",
                  "subtitle": "You have a call request",
                  "android_channel_id": "12345654321",
                },
                "data": {
                    "body": "call request",
                    "title": "call request",
                    "name": "hellworld",
                    "call": {
                        "name": __callData.doctorEmail,
                        "time": new Date(),
                        "patient": __callData.patientEmail,
                        "doctor": __callData.doctorEmail,
                        "caller": `Scheduled Call`,
                        "status": 'started',
                        "end_now": 'false',
                        "channel": res.data.RTCChannel,
                        "token": res.data.RTCAccessToken
                    }
                },
                "content_available": true,
                "priority": "high"
              }, {
                headers: {
                  Authorization : `key=AAAAEfHKSRA:APA91bH2lfkOJ8bZUGvMJo7cqdLYqk1m633KK7eu5pEaUF0J1ieFgpcWtYItCRftxVLSghEOZY5cQ8k9XfB_PVyfQeDHiC5ifuowqYUytsF0Nby4ANcZhVcFj6E0u5df2c4LItkjq4H2`
                }
              })
            }
            // if(snapshot.docs.length > 0){
              
            
        })
          // end
    
        }catch(e){
            console.log('aa')
            console.log(e)
        }
    }

    const agoraInit = async (RTCChannel: any, RTCAccessToken: any) =>{
        setAgoraData({
            RTCChannel,
            RTCAccessToken
        });

        setIsLoading(false);
    }

    useEffect(()=>{
        if(trackerRef.current == 0){
            init();
        }

        trackerRef.current = 1;
    }, [])

    // renderss
    if(isLoading){
        return (
            <ClipLoader
                color={'#ffffff'}
                loading={true}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        )
    }

    return (
        <AgoraView RTCAccessToken={agoraData.RTCAccessToken} RTCChannel={agoraData.RTCChannel} callData={callDataOne} />
    )
}