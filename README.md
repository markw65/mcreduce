# mcreduce
Wrapper for creduce to help produce test cases for @markw65/monkeyc-optimizer

In order to use this, you need [creduce](https://github.com/csmith-project/creduce), and [node-js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed

Once you have those, clone this repository, and initialize it: 
```sh
git clone https://github.com/markw65/mcreduce.git
cd mcreduce
npm install
```

Now you need to overwrite mysource.mc with the code you want to reduce, and update the tests in creduce-step.js to test for your particular issue.

The example test case is setup as follows. We have this function:

```
function condAdd(
    y as Number,
    gaugeOnTop as Boolean,
    other as Boolean
) as Number {
    var ly = y;
    if (gaugeOnTop) {
        ly += gaugeHeight1;
    }
    if (other) {
        return ly;
    }
    return 0;
}
```

and when it gets optimized, the compiler gets rid of ly altogether, 
and just uses y instead (this is actually a good thing, but lets 
pretend we want to produce a small test case with this behavior)

`creduce` is going to remove random parts of the program, and then call a script that we supply to determine whether the problem is still there.

The script is creduce-step.sh, which just invokes creduce-step.js. That does the following:
```
  if (
    !/if\s*\(gaugeOnTop\)\s*\{\s*ly\s*\+=\s*gaugeHeight1;\s*\}/.test(sourceIn)
  ) {
    // If the interesting part of the input has been removed,
    // creduce has gone too far. So bail here
    console.log("Fail on entry");
    process.exit(1);
  }
```
This checks that `if (guageOnTop) { ly += guageHeight1; }` hasn't been removed. If it has, we don't want to pursue it, and so we call `process.exit(1)`.
Otherwise, the script goes on to invoke the optimizer on `mysource.mc`, producing `optimized/source/mysource.mc`, and then we check that
this still exhibits the "problem":
```
  if (
    !/if\s*\(gaugeOnTop\)\s*\{\s*y.*\+=\s*gaugeHeight1;\s*\}/.test(sourceOut)
  ) {
    // if it doesn't match, we've gone too far.
    console.log("Fail on exit");
    process.exit(1);
  }
```

We run this via:
```sh
creduce creduce-step.sh mysource.mc
```

This will run for quite a while, but fairly quickly gets down to a pretty small test case.
You can interrupt it at any time and take a look at the current state of the source
(or just go to another terminal and look at it there). Note that creduce operates directly on
the file you give it (but saves a copy as mysource.mc.orig).
