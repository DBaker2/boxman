import React from 'react';

/* ====================================================
  Component that handles all the webrtc connection stuff.
  I made this a component so it could tell its parent component when videos are added and deleted. I think that makes sense...
==================================================== */
const RTC = React.createClass({
  propTypes: {
    config: React.PropTypes.shape({
      character: React.PropTypes.string.isRequired,
      roomName: React.PropTypes.string.isRequired,
      constraints: React.PropTypes.shape({
        audio: React.PropTypes.bool.isRequired,
        video: React.PropTypes.bool.isRequired
      }).isRequired,
      iceServers: React.PropTypes.object
    }),
    addedVideo: React.PropTypes.func,
    removedVideo: React.PropTypes.func,
    newMessage: React.PropTypes.func.isRequired,
  },

  componentDidMount: function() {
    this._connect(this.props.config);
  },
  
  _connect: function(config) {
    console.log('clicked connect');
    this._stunAndTurn(config);
  },

  // specify stun and turn servers for help establishing connection between clients
  _stunAndTurn: function(config) {
    let conf;
    console.log('connecting to XirSys...');
    // I know including the secret here isn't super secure, but it's a free stun and turn server so whatevs
    fetch('https://service.xirsys.com/ice?ident=brainsandspace&secret=09f8d0aa-7940-11e5-8514-a68d4d023276&domain=www.brainsandspace.com&application=default&room=default&secure=1')
      .then(response => {
        return response.json();
      })
      .then((data) => {
        // data.d is where the ICE servers object lives
        console.log('...connected to XirSys', data.d);
        config['iceServers'] = data.d;
        this._setUpRTC(config);
      })
      .catch((err) => {
        console.error(err);
    });
  },

  _setUpRTC: function(config) {

    // force the camera guy to use back camera
    if (config.character === 'cameraGuy') {
      navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        console.log(`there are ${devices.length} devices`);
        console.log('devices: ', devices);
        for (let i = 0; i < devices.length; i++) {
          if (devices[i].label.includes('back')) {
            // assuming the back camera is labeled with back somehow, like on my samsung galaxy s6 edge+, 
            // where the back camera has the label "camera2 0, facing back"
            config.constraints.video = {
              sourceId: devices[devices.length-1].deviceId
            };
            break;
          }
        }
        })
      .catch(function(err) {
        console.error(err.name + ": " + error.message);
      });
    }

    this.webrtc = new SimpleWebRTC({
      localVideoEl: config.character === 'cameraGuy' ? document.getElementById('viewfinder') : null,
      autoRequestMedia: config.character === 'cameraGuy' ? true : false,
      // TODO specify this based on character
      media: config.constraints,
      peerConnectionConfig: config.iceServers
    });
    console.log('media', config.constraints);

    this.webrtc.on('readyToCall', () => {
      this.webrtc.joinRoom(config.roomName, (err, roomDescription) => {
        if (err) console.error(err);
        console.log('roomDescription: ', roomDescription);
      });
    });

    if (config.character === 'boxMan') {
      this.webrtc.on('videoAdded', (videoEl, peer) => { this.props.addedVideo(videoEl.srcObject); });
      this.webrtc.on('videoRemoved', (videoEl, peer) => { this.props.removedVideo(videoEl.srcObject); });
    }

    // for some reason, I couldn't figure out how to get this.webrtc.sendToAll to work (via sockets), so I ended up using the P2P data channel
    this.webrtc.on('channelMessage', (peer, channel, data) => {
      console.log('channelMessage', peer, channel, data);
      // console.log('message received with data: ', data, other)
      // if (data.type !== 'candidate' && data.type !== 'offer')      console.log(data)
      if (data.type === 'chat') {
        console.log('incoming message:', data.payload);
        this.props.newMessage(data.payload);
        // this.webrtc.sendDirectlyToAll('channelMessage', 'chat', `love from data channel ${config.character}`)
      }
    });
    
    let sendTest = document.getElementById('test');
    test.onclick = () => {
      this.webrtc.sendDirectlyToAll('channel1','chat', {message:`love from the button of ${config.character}`});
    };
  },
  render: function() {
    return null;
  }
});

export default RTC;



