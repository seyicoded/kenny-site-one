import React, { useEffect, useRef, useState } from 'react'

import {
    ClientConfig,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

import {
    AgoraVideoPlayer,
    createClient,
    createMicrophoneAndCameraTracks,
} from "agora-rtc-react";

import "./agoraView.css"
import { doc, updateDoc } from 'firebase/firestore';
import { getSavedFireStore } from '../firebase/firebase';

type Props = {
    RTCChannel: any,
    RTCAccessToken: any,
    callData: any
}

const config: ClientConfig = { 
    mode: "rtc", codec: "vp8",
  };
  
const appId: string = "a90dea913c844cd7bcada446242c6150"; //ENTER APP ID HERE



export default function AgoraView(props: Props) {
    const callData = props.callData;
    const trackRef = useRef(1);
    const useClient = createClient(config);
    const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

    const { RTCChannel: channelName } = props;
    const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [start, setStart] = useState<boolean>(false);
    const client = useClient();
    const { ready, tracks } = useMicrophoneAndCameraTracks();


    useEffect(() => {
        // function to initialise the SDK
        let init = async (name: string) => {
          client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            console.log("custom-logger", "subscribe success");
            if (mediaType === "video") {
              setUsers((prevUsers) => {
                return [...prevUsers, user];
              });
            }
            if (mediaType === "audio") {
              user.audioTrack?.play();
            }
          });
    
          client.on("user-unpublished", (user, type) => {
            console.log("custom-logger", "unpublished", user, type);
            if (type === "audio") {
              user.audioTrack?.stop();
            }
            if (type === "video") {
              setUsers((prevUsers) => {
                return prevUsers.filter((User) => User.uid !== user.uid);
              });
            }
          });
    
          client.on("user-left", (user) => {
            console.log("custom-logger", "leaving", user);
            setUsers((prevUsers) => {
              return prevUsers.filter((User) => User.uid !== user.uid);
            });
          });
    
          await client.join(appId, name, props.RTCAccessToken, null);
          if (tracks) await client.publish([tracks[0], tracks[1]]);
          setStart(true);
    
        };
    
        if (ready && tracks) {
          console.log("custom-logger", "init ready");

          if(trackRef.current == 1){
            init(channelName);
          }

          trackRef.current = 2;
        }
    
    }, [channelName, client, ready, tracks]);

    const Controls = (props: {tracks, setStart}) => {
        const client = useClient();
        const { tracks, setStart } = props;
        const [trackState, setTrackState] = useState({ video: true, audio: true });
        
        const mute = async (type: "audio" | "video") => {
          if (type === "audio") {
            await tracks[0].setEnabled(!trackState.audio);
            setTrackState((ps) => {
              return { ...ps, audio: !ps.audio };
            });
          } else if (type === "video") {
            await tracks[1].setEnabled(!trackState.video);
            setTrackState((ps) => {
              return { ...ps, video: !ps.video };
            });
          }
        };
        
        const leaveChannel = async () => {
          await client.leave();
          client.removeAllListeners();
          tracks[0].close();
          tracks[1].close();
          setStart(false);
        };

        const endChannel = async () => {
          await client.leave();
          client.removeAllListeners();
          tracks[0].close();
          tracks[1].close();
          setStart(false);

          await updateDoc(doc(getSavedFireStore(), "normal_calls", callData.patientEmail), {
            data: {
                time: new Date(),
                status: 'ended',
                end_now: 'true',
            }
        });

        //   firebase
        //   .firestore()
        //   .collection('normal_calls')
        //   .doc(email)
        //   .set(
        //     {
        //       data: {
        //         status: 'ended',
        //       },
        //     },
        //     {merge: true},
        //   );
        };
      
        return (
          <div className="controls">
            <p className={trackState.audio ? "on" : ""}
              onClick={() => mute("audio")}>
              {trackState.audio ? "MuteAudio" : "UnmuteAudio"}
            </p>
            <p className={trackState.video ? "on" : ""}
              onClick={() => mute("video")}>
              {trackState.video ? "MuteVideo" : "UnmuteVideo"}
            </p>
            {<p onClick={() => leaveChannel()}>Leave Call</p>}
            {<p style={{ background: 'red' }} onClick={() => endChannel()}>End Call</p>}
          </div>
        );
      };

    return (
        <div>

            <div className="App">
                {ready && tracks && (
                    <Controls tracks={tracks} setStart={setStart} />
                )}
                {start && tracks && <Videos users={users} tracks={tracks} />}
            </div>

        </div>
    )
}

const Videos = (props: {
    users: IAgoraRTCRemoteUser[];
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
  }) => {
    const { users, tracks } = props;
  
    return (
      <div>
        <div id="videos">
          <AgoraVideoPlayer className='vid' videoTrack={tracks[1]} />
          {users.length > 0 &&
            users.map((user, index) => {
              if (user.videoTrack) {
                return (
                  <AgoraVideoPlayer className='vid' videoTrack={user.videoTrack} key={user.uid} />
                    // <div>{index}</div>
                );
              } else return null;
            })}
        </div>
      </div>
    );
};