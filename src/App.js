import React, { Component } from "react";
import {
  Card,
  Container,
  Button,
  Select,
  Statistic,
  Input,
  Dimmer,
  Loader,
  Label,
  Form,
  TextArea,
  Icon,
  Message,
  Modal,
  Header
} from "semantic-ui-react";
import "./App.css";

var analytics = window.analytics;

const pools = [
  {
    value: "coinhive",
    text: "CoinHive",
    commision: 30,
    difficulty: 256,
    minimum: 0.05,
    website: "coinhive.com"
  },
  {
    value: "supportxmr",
    text: "supportXMR.com",
    commision: 0.6,
    difficulty: 1000,
    minimum: 0.5,
    website: "supportxmr.com"
  },
  {
    value: "usxmrpool",
    text: "US XMR Pool",
    commision: 0.5,
    difficulty: 3000,
    minimum: 0.5,
    website: "usxmrpool.com"
  },
  {
    value: "minexmr",
    text: "mineXMR.com",
    commision: 1,
    difficulty: 15000,
    minimum: 0.5,
    website: "minexmr.com"
  },
  {
    value: "nanopool",
    text: "Nanopool",
    commision: 1,
    difficulty: 150000,
    minimum: 1,
    website: "xmr.nanopool.org"
  }
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      email: localStorage.email,
      pool: null,
      waiting: false,
      waitingForEmailConfirmation: false,
      waitingForDeployment: false,
      registration: {
        token: "v8897mzg6vDOXWKyOh44RWY6",
        securityCode: "Sunny Pied Tamarin"
      },
      token: "Sunny Pied Tamarin",
      deployment: {
        uid: "e06gUv1PEce3kbUrug7TF0rh",
        host: "proxy-khlizawelj.now.sh",
        state: "READY",
        stateTs: "2017-10-23T04:01:17.145Z",
        scale: {
          min: 0,
          max: 1,
          auto: true
        }
      },
      status: "READY",
      error: null
    };
  }

  handleChangePool = (event, data) => {
    localStorage.pool = data.value;
    this.setState({
      pool: data.value
    });
  };

  handleChangeEmail = (event, data) => {
    localStorage.email = data.value;
    this.setState({
      email: data.value
    });
  };

  handleSelectPool = () => {
    analytics.track("CREATE PROXY - " + this.state.pool.toUpperCase(), {
      pool: this.state.pool
    });
    this.setState({ step: 1 });
  };

  handleEmailRegistration = async () => {
    try {
      this.setState({
        waiting: true,
        waitingForEmailConfirmation: true,
        waitingForDeployment: false,
        registration: null,
        token: null,
        deployment: null,
        status: null,
        error: null
      });
      const resp = await fetch(`https://hook.io/zeit/registration?email=${this.state.email}`);
      const json = await resp.json();
      this.setState({
        registration: json
      });
      analytics.track("EMAIL REGISTERED");
      this.handleEmailVerification();
    } catch (e) {
      this.setState({
        error: e.message
      });
    }
  };

  handleEmailVerification = async () => {
    try {
      const resp = await fetch(
        `https://hook.io/zeit/verify?email=${this.state.email}&token=${this.state.registration.token}`
      );
      const json = await resp.json();
      if (json.token) {
        this.setState({
          waitingForEmailConfirmation: false,
          waitingForDeployment: true,
          token: json.token
        });
        analytics.track("EMAIL VERIFIED");
        this.handleDeployment();
      } else {
        setTimeout(() => this.handleEmailVerification(), 2000);
      }
    } catch (e) {
      this.setState({
        error: e.message
      });
    }
  };

  handleDeployment = async () => {
    try {
      this.setState({
        waiting: true,
        waitingForEmailConfirmation: false,
        waitingForDeployment: true,
        deployment: null,
        status: null,
        error: null
      });
      analytics.track("DEPLOYMENT STARTED");
      const resp = await fetch(`https://hook.io/zeit/deploy?token=${this.state.token}&pool=${this.state.pool}`);
      const json = await resp.json();
      if (json.error) {
        analytics.track("ERROR", {
          message: json.error.message
        });
        this.setState({ error: json.error.message });
      } else {
        this.setState({
          deployment: json,
          status: json.state
        });
        analytics.track("DEPLOYMENT BOOTED");
        this.handleDeploymentStatus();
      }
    } catch (e) {
      analytics.track("ERROR", {
        message: e.message
      });
      this.setState({
        error: e.message
      });
    }
  };

  handleDeploymentStatus = async () => {
    try {
      const resp = await fetch(`https://hook.io/zeit/status/${this.state.deployment.uid}?token=${this.state.token}`);
      const json = await resp.json();
      this.setState({
        status: json.state
      });
      if (json.state != "READY") {
        setTimeout(() => this.handleDeploymentStatus(), 1000);
      } else {
        this.setState({
          waitingForDeployment: false,
          waiting: false,
          step: 2
        });
        analytics.track("DEPLOYMENT READY");
      }
    } catch (e) {
      analytics.track("ERROR", {
        message: e.message
      });
      this.setState({
        error: e.message
      });
    }
  };

  renderError() {
    if (!this.state.error) {
      return null;
    }
    return (
      <Message negative header="Error" content={this.state.error} onDismiss={() => this.setState({ error: null })} />
    );
  }

  renderHelp() {
    return (
      <h4 className="help">
        <a onClick={() => this.setState({ showHelp: true })}>What's this?</a>
        <Modal open={this.state.showHelp} onClose={() => this.setState({ showHelp: false })} basic size="small">
          <Header content="What's CoinHive Proxy?" />
          <Modal.Content>
            <p>
              This website allows you to create your own proxy for{" "}
              <a target="_blank" href="https://coinhive.com">
                coinhive.com
              </a>.
            </p>
            <p>
              This way you can avoid being blocked by an <b>AdBlock</b>.
            </p>
            <p>
              It uses{" "}
              <a target="_blank" href="https://github.com/cazala/coin-hive-stratum">
                coin-hive-stratum
              </a>{" "}
              under the hood and deploys the proxy instance to{" "}
              <a target="_blank" href="https://zeit.co/now">
                zeit.co/now
              </a>.
            </p>
            <p>
              With this proxy you can also mine on a <b>different pool</b> than CoinHive's, with a different{" "}
              <b>commision</b> and <b>difficulty</b>.
            </p>
            <p>
              Once your proxy is created, you just have to replace CoinHive's miner url with <b>your proxy url</b>.
            </p>
            <p>Go ahead and create your proxy in a few seconds!</p>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={() => this.setState({ showHelp: false })} inverted>
              <Icon name="checkmark" /> Got it
            </Button>
          </Modal.Actions>
        </Modal>
      </h4>
    );
  }

  renderStep0() {
    const pool = pools.find(pool => pool.value === this.state.pool);
    return (
      <div className="app">
        <Container className="container">
          <Card fluid>
            <Card.Content>
              <h1>CoinHive Proxy 🎉</h1>
              <p className="subtitle">Avoid AdBlock. Mine on other pools using CoinHive.</p>
            </Card.Content>
            <Card.Content>
              <Select
                fluid
                value={this.state.pool}
                options={pools}
                onChange={this.handleChangePool}
                placeholder="Select a pool..."
              />
            </Card.Content>
            {pool ? (
              <Card.Content className="pool-info-wrapper">
                <Statistic.Group size="mini" className="pool-info">
                  <Statistic>
                    <Statistic.Value>{pool.commision}%</Statistic.Value>
                    <Statistic.Label>Commission</Statistic.Label>
                  </Statistic>
                  <Statistic>
                    <Statistic.Value>{pool.difficulty}</Statistic.Value>
                    <Statistic.Label>Difficulty</Statistic.Label>
                  </Statistic>
                  <Statistic>
                    <Statistic.Value>{pool.minimum} XMR</Statistic.Value>
                    <Statistic.Label>Minimum Payment</Statistic.Label>
                  </Statistic>
                </Statistic.Group>
              </Card.Content>
            ) : null}
            <Card.Content>
              <Button secondary fluid onClick={this.handleSelectPool} disabled={!this.state.pool}>
                Get your proxy
              </Button>
            </Card.Content>
          </Card>
          {this.renderError()}
          {this.renderHelp()}
        </Container>
      </div>
    );
  }

  renderStep1() {
    return (
      <div className="app">
        <Container className="container">
          <Card fluid>
            <Dimmer active={this.state.waiting}>
              {this.state.waitingForEmailConfirmation && !this.state.registration ? (
                <Loader>Sending email...</Loader>
              ) : null}
              {this.state.waitingForEmailConfirmation && this.state.registration ? (
                <Loader>
                  <label>Email sent to:</label>
                  <p style={{ marginTop: 10 }}>
                    <b>{this.state.email}</b>
                  </p>
                  <p>Security code:</p>
                  <Label>{this.state.registration.securityCode}</Label>
                  <p style={{ marginTop: 20 }}> Waiting for your confirmation...</p>
                </Loader>
              ) : null}
              {this.state.waitingForDeployment && !this.state.status ? <Loader>Deploying...</Loader> : null}
              {this.state.waitingForDeployment && this.state.status ? (
                <Loader>
                  <label>Deploying...</label>
                  <p style={{ marginTop: 20 }}>{this.state.status}</p>
                </Loader>
              ) : null}
            </Dimmer>
            <Card.Content>
              <h1>Deploy Your Proxy 🚀</h1>
              <p className="subtitle">
                We will deploy your proxy to{" "}
                <a target="_blank" href="https://zeit.co/now">
                  zeit.co/now
                </a>.
              </p>
              <p className="subtitle">If you don't have an account we will create one for you.</p>
            </Card.Content>
            <Card.Content>
              <Input
                value={this.state.email}
                placeholder="Enter your email..."
                fluid
                onChange={this.handleChangeEmail}
              />
            </Card.Content>
            <Card.Content>
              <Button
                secondary
                fluid
                className="deploy-btn"
                onClick={this.handleEmailRegistration}
                disabled={!this.state.email}
              >
                Deploy to <b>▲ Z E I T</b>
              </Button>
            </Card.Content>
          </Card>
          {this.renderError()}
          {this.renderHelp()}
        </Container>
      </div>
    );
  }

  renderStep2 = () => {
    const pool = pools.find(pool => pool.value === this.state.pool);
    return (
      <div className="app">
        <Container className="container">
          <Card fluid>
            <Card.Content>
              <h1>Congrats 🎉</h1>
              <p className="subtitle">
                Your proxy has been deployed to{" "}
                <a target="_blank" href={"https://" + this.state.deployment.host + "/_src"}>
                  {this.state.deployment.host}
                </a>!
              </p>
            </Card.Content>
            <Card.Content>
              <p>Now you can replace CoinHive's miner with this:</p>
              <Input
                className="script"
                fluid
                value={`<script src="https://${this.state.deployment.host}/client?proxy"></script>`}
                readOnly
              />
              <p>Use it the same way you would use the regular CoinHive miner:</p>
              <Form>
                <TextArea
                  fluid
                  autoHeight={false}
                  rows={6}
                  value={`<script src="https://${this.state.deployment.host}/client?proxy"></script>
<script>
  var miner = new CoinHive.Anonymous('${this.state.pool === "coinhive" ? "YOUR_SITE_KEY" : "YOUR_MONERO_ADDRESS"}');
  miner.start();
</script>`}
                  readOnly
                />
              </Form>
            </Card.Content>
            <Message attached="middle" info>
              <p>
                You can manage your proxy from{" "}
                <a href="https://zeit.co/dashboard" target="_blank">
                  {"zeit.co/dashboard"}
                </a>.
              </p>
            </Message>
            {this.state.pool !== "coinhive" ? (
              <Message attached="bottom" warning>
                <p>
                  You are mining on <b>{pool.text}</b>.
                </p>
                <p>This is a different pool than CoinHive.</p>
                <p>
                  You will need to use a <b>Monero Wallet Address</b> instead of a Site Key.
                </p>
                <p>
                  If you don't have a Monero Wallet, you can get one from{" "}
                  <a href="https://mymonero.com" target="_blank">
                    mymonero.com&nbsp;
                    <Icon name="external" size="small" />
                  </a>.
                </p>
                <p>
                  To see your stats, go to {" "}
                  <a href={"http://" + pool.website} target="_blank">
                    {pool.website}&nbsp;
                    <Icon name="external" size="small" />
                  </a>.
                </p>
              </Message>
            ) : null}
          </Card>
          {this.renderError()}
          {this.renderHelp()}
        </Container>
      </div>
    );
  };

  render() {
    switch (this.state.step) {
      case 2:
        return this.renderStep2();
      case 1:
        return this.renderStep1();
      case 0:
      default:
        return this.renderStep0();
    }
  }
}

export default App;
