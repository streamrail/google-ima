# google-ima

An element providing Google IMA SDK functionality.

## Example

Build the project and see docs on `http://localhost:8080/components/google-ima/` for api spec and demo, or check out a demo here:

```

  <google-ima 
    sources='[{
      "src": "http://media.streamrail.com/test/hnm.mp4",
      "type": "video/mp4"
    }]'
    adtagurl='http://pubads.g.doubleclick.net/gampad/ads?sz=400x300&iu=%2F6062%2Fiab_vast_samples&ciu_szs=300x250%2C728x90&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]&cust_params=iab_vast_samples%3Dlinear'
    linearadslotwidth=640
    linearadslotheight=400
    nonlinearadslotwidth=640
    nonlinearadslotheight=150
    autoplay>
```


## Dependencies

Element dependencies are managed via [Bower](http://bower.io/). You can
install that via:

    npm install -g bower

Then, go ahead and download the element's dependencies:

    bower install


## Playing With Your Element

If you wish to work on your element in isolation, we recommend that you use
[Polyserve](https://github.com/PolymerLabs/polyserve) to keep your element's
bower dependencies in line. You can install it via:

    npm install -g polyserve

And you can run it via:

    polyserve

Once running, you can preview your element at
`http://localhost:8080/components/google-ima/`, where `google-ima` is the name of the directory containing it.

# license 
MIT 