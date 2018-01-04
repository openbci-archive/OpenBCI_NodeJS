# OpenBCI NodeJS SDK

<p align="center">
  <img alt="banner" src="/images/openbci_large.png/" width="400">
</p>
<p align="center" href="">
  Provide a single source to program all OpenBCI biosensors in NodeJS
</p>

[![Stories in Ready](https://badge.waffle.io/OpenBCI/OpenBCI_NodeJS.png?label=ready&title=Ready)](https://waffle.io/OpenBCI/OpenBCI_NodeJS)
[![Join the chat at https://gitter.im/OpenBCI/OpenBCI_NodeJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/OpenBCI/OpenBCI_NodeJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/OpenBCI/OpenBCI_NodeJS.svg?branch=master)](https://travis-ci.org/OpenBCI/OpenBCI_NodeJS)
[![npm](https://img.shields.io/npm/dm/openbci.svg?maxAge=2592000)](http://npmjs.com/package/openbci)

## Welcome!

First and foremost, Welcome! :tada: Willkommen! :confetti_ball: Bienvenue! :balloon::balloon::balloon:

Thank you for visiting the OpenBCI NodeJS SDK repository. This repository does not contain any specific source code and bugs for a specific biosensor should be open in their respective repositories: [Cyton][link_nodejs_cyton] | [Ganglion][link_nodejs_ganglion] | [WiFi Shield][link_nodejs_wifi] | [Utilities][link_javascript_utilities]. Checkout [this blog post](http://openbci.com/community/nodejs-ecosystem-overhaul-cyton-stable-and-ganglion-in-beta/) to understand the rational behind this modular structure of our java script code base.

This document (the README file) is a hub to give you some information about the project. Jump straight to one of the sections below, or just scroll down to find out more.

* [What are we doing? (And why?)](#what-are-we-doing)
* [Who are we?](#who-are-we)
* [What do we need?](#what-do-we-need)
* [How can you get involved?](#get-involved)
* [Get in touch](#contact-us)
* [Find out more](#find-out-more)
* [Understand the jargon](#glossary)

## What are we doing?

### The problem

* There are a bunch of NodeJS repos for the Ganglion, Cyton and Wifi Shield
* Examples are spread out across all these NodeJS repos
* Some examples across NodeJS repos have the same code
* There is no common interface for these NodeJS repos
* NodeJS is a powerful tool for 

So, if even the very best developers want to use NodeJS with their OpenBCI boards, they are left scratching their heads with where to begin. integrate the current easy to use Cyton and Ganglion NodeJS drivers, they are still burdened by the limitations of the physical hardware on the OpenBCI system.

### The solution

The OpenBCI NodeJS SDK will:

* Allow NodeJS users to import one module and use any board they choose
* Provide examples of using NodeJS to port data to other apps like python and lab streaming layer
* Provide a no low level device specific code to prevent the need to rewrite new examples for each board
* Provide examples of filtering and different functions to transform raw data
* Provide a common interface to all openbci boards to increase the speed at which new boards can be integrated

Using this repo provides a building block for developing with NodeJS. The goal for the NodeJS library is to ***provide a single source to program all OpenBCI biosensors in NodeJS***

## Who are we?

The founder of the OpenBCI NodeJS SDK is [AJ Keller][link_aj_keller]. If we look back in time, we see this library took shape when the [Cyton][link_shop_cyton] board was the only [OpenBCI][link_openbci] board around. Then the [Ganglion][link_shop_ganglion] came around which required it's own [nodejs libary][link_nodejs_ganglion]! When the [wifi shield][link_shop_wifi_shield] was in development, AJ created the [wifi nodejs driver][link_nodejs_wifi] which was had a lot of overlap with Cyton and Ganglion nodejs drivers. Therefore AJ pulled out the common code between all three NodeJS modules and created the [nodejs utilities][link_nodejs_utilities] which as of today is also available to use in the browser. 

The contributors to these repos are people using NodeJS mainly for their data acquisition purposes. For example, the entire OpenBCI GUI is dependent on the NodeJS ecosystem to provide cross platform support.   

## What do we need?

**You**! In whatever way you can help.

We need expertise in programming, user experience, software sustainability, documentation and technical writing and project management.

We'd love your feedback along the way.

Our primary goal is to provide a single source to program all OpenBCI biosensors in NodeJS, and we're excited to support the professional development of any and all of our contributors. If you're looking to learn to code, try out working collaboratively, or translate you skills to the digital domain, we're here to help.

## Get involved

If you think you can help in any of the areas listed above (and we bet you can) or in any of the many areas that we haven't yet thought of (and here we're *sure* you can) then please check out our [contributors' guidelines](CONTRIBUTING.md) and our [roadmap](ROADMAP.md).

Please note that it's very important to us that we maintain a positive and supportive environment for everyone who wants to participate. When you join us we ask that you follow our [code of conduct](CODE_OF_CONDUCT.md) in all interactions both on and offline.


## Contact us

If you want to report a problem or suggest an enhancement we'd love for you to [open an issue](../../issues) at this github repository because then we can get right on it. But you can also contact [AJ][link_aj_keller] by email (pushtheworldllc AT gmail DOT com) or on [twitter](https://twitter.com/aj-ptw).

You can also hang out, ask questions and share stories in the [OpenBCI NodeJS room](https://gitter.im/OpenBCI/OpenBCI_NodeJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) on Gitter.

## Find out more

You might be interested in:

* Purchase a [Cyton][link_shop_cyton] | [Ganglion][link_shop_ganglion] | [WiFi Shield][link_shop_wifi_shield] from [OpenBCI][link_openbci]
* Get taught how to use OpenBCI devices by [Push The World][link_ptw] BCI Consulting

And of course, you'll want to know our:

* [Contributors' guidelines](CONTRIBUTING.md)
* [Roadmap](ROADMAP.md)

## Glossary

OpenBCI boards are commonly referred to as _biosensors_. A biosensor converts biological data into digital data. 

The [Ganglion][link_shop_ganglion] has 4 channels, meaning the Ganglion can take four simultaneous voltage readings.
 
The [Cyton][link_shop_cyton] has 8 channels and [Cyton with Daisy][link_shop_cyton_daisy] has 16 channels. 

Generally speaking, the Cyton records at a high quality with less noise. Noise is anything that is not signal.

## Thank you

Thank you so much (Danke schön! Merci beaucoup!) for visiting the project and we do hope that you'll join us on this amazing journey to make programming with OpenBCI fun and easy.

## <a name="install"></a> Installation:
```
npm install openbci
```

## <a name="developing"></a> Developing:
### <a name="developing-running"></a> Running:

```
npm install --all
```

## <a name="license"></a> License:

MIT

[link_aj_keller]: https://github.com/aj-ptw
[link_shop_wifi_shield]: https://shop.openbci.com/collections/frontpage/products/wifi-shield?variant=44534009550
[link_shop_ganglion]: https://shop.openbci.com/collections/frontpage/products/pre-order-ganglion-board
[link_shop_cyton]: https://shop.openbci.com/collections/frontpage/products/cyton-biosensing-board-8-channel
[link_shop_cyton_daisy]: https://shop.openbci.com/collections/frontpage/products/cyton-daisy-biosensing-boards-16-channel
[link_nodejs_cyton]: https://github.com/openbci/openbci_nodejs_cyton
[link_nodejs_ganglion]: https://github.com/openbci/openbci_nodejs_ganglion
[link_nodejs_wifi]: https://github.com/openbci/openbci_nodejs_wifi
[link_javascript_utilities]: https://github.com/OpenBCI/OpenBCI_JavaScript_Utilities
[link_ptw]: https://www.pushtheworldllc.com
[link_openbci]: http://www.openbci.com
[link_mozwow]: http://mozillascience.github.io/working-open-workshop/index.html
[link_wifi_get_streaming]: examples/getStreaming/getStreaming.js
[link_openleaderscohort]: https://medium.com/@MozOpenLeaders
[link_mozsci]: https://science.mozilla.org
