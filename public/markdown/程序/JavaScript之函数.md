### javascript中的函数
#### 函数简介
函数就是为了完成一些特殊的任务而创建的**模块**，函数可以传入数据，处理数据，返回结果。函数可以被重复使用。函数可以嵌套调用。

为什么要用函数？
1. 函数可以使我们的程序分解成一组子步骤（sub-steps），写出模块化的程序。
2. 避免重复编写代码，实现了代码复用。
3. 函数使得变量命名空间变得干净。
4. 方便测试。

函数是一个黑盒（black boxes），因为我们不需要知道它是怎么工作的。只需要了解需要传入的参数和预期返回的结果，即它做了什么。

函数控制流如下
1. The program comes to a line of code containing a "function call".
2. The program enters the function (starts at the first line in the function code).
3. All instructions inside of the function are executed from top to bottom.
4. The program leaves the function and goes back to where it started from.
5. Any data computed and RETURNED by the function is used in place of the function in the original line of code.

#### js中的函数
**变量作用域**
变量在声明它们的函数体以及这个函数体嵌套的任意函数体内都是有定义的。从变量被声明的位置我们可以将变量分为两类，函数内定义的变量叫局部变量，函数外定义的变量叫全局变量。函数是唯一能定义变量作用域的语块（注：考虑到兼容性，ES6中引入的let语句除外）。
需要注意几个问题
函数中声明局部变量忘记写`var`关键字，全局变量被污染了。
```javascript
var name = 'lisi';
function test() {
    name = 'zhangsan';
}
test();
console.log(name);
```
在for循环中不要忘记声明计数器
```javascript
function test() {
    var i;
    for (i = 0; i < 10; i++) {
        // ...
    }
}
test();
```

**变量提升**
```javascript
var name = 'zhangsan';
function say() {
    console.log(name); // undefined
    var name = 'lisi';
}
// 和下面注释的代码等价
/*
function say() {
    var name;
    console.log(name);
    name = 'lisi';
}
*/
say();
```
变量name存在于函数say的整个作用域中，但是该变量的值只有在执行到`var name = 'lisi'`这一行时才会初始化，在这之前的值为`undefined`，js这一特性叫做变量提升。
注意：如果name无论在函数外还是函数内都没有定义，会报错`name is not defined`,终止程序运行。
```javascript
function say() {
    console.log(name); // name is not defined
}
say();
```

**再提升**
引擎控制流被函数接管，即js引擎进入函数作用域时，有2步操作
1.初始化变量
- 声明并初始化函数参数
- 声明局部变量（包括将匿名函数赋给一个局部变量），但不初始化
- 声明并初始化函数

2.执行代码

再看一个例子
```javascript
var name = 'zhangsan';
function say(name) {
    console.log(name); // wangwu
    /*
     var name = 'lisi';
     console.log(name); // lisi
     */
    var name;
    console.log(name); // wangwu
}
say('wangwu');
```
函数`say`中的参数`name`先声明并初始化为值`wangwu`，第一个输出符合我们预期。接下来又声明了变量`name`，由于执行环境对象中已经存在`name`属性，此时`name`值并没有被`undefined`覆盖，依然为`wangwu`，以上为第一步操作，而第二步`name`没有进行初始化操作，因而值没有变化。
如果我们选择用注释中的代码替换8，9行代码时，第一步和替换前完全一致，第二步中当引擎执行到`var name = 'lisi'`这一行时，`name`变量的值由`wangwu`初始化为`lisi`。

函数`sya`在运行时创建一个执行环境对象，函数中的参数、局部 变量、方法都会放入这个对象中。
```javascript
{
    name: 'wangwu'
}
```
执行环境对象是对函数执行环境的一种抽象，不能直接访问，但每次使用变量都是在间接访问执行环境对象的属性。

**作用域链**
js寻找变量先在局部执行环境对象上寻找，如果没定义，则到创建它的执行环境中去，并且在该执行环境对象中查找变量的定义，以此类推，直到找到定义或者到达全局作用域为止，也就是说，在查找一个变量的值时，结果可能来自作用域链上的任何地方。
全局变量是执行环境顶层对象的属性，这个顶层对象在浏览器中是`window`对象，在Node.js中，顶层对象叫做`global`。

**函数是对象**
js中的函数比其他编程语言承担了更多的角色。函数是对象，因此函数可以赋值给变量，也可以作为函数的参数。

函数对象
```javascript
function f1(str) {
    console.log(str)
}
var f2 = function (str) {
    console.log(str);
};
var f3 = new Function('str', 'console.log(str)');
```

普通对象
```javascript
var o1 = {};
var o2 = new Object();
```

一提起对象，我们就想起对象应具有三大特性，封装、继承、多态。
函数本身是对象，但我们也可以通过函数来实现传统语言中的对象。
我们先用构造函数创建一个对象
```javascript
function People(name, id) {
    this.name = name;
    this.id = id;
}
var zhangsan = new People('zhangsan', 'No.1');
var lisi = new People('lisi', 'No.2');
People('wangwu', 'No.3');
console.log(zhangsan.name); // zhangsan
console.log(lisi.id); // No.2
console.log(window.name); // wangwu
```
函数`People`是一个构造函数，通过关键字`new`创建一个对象，将构造方法中的this指针指向该对象。去掉`new`，构造函数中的`this`指向了`window`。如果没有`new`，就是一个普通函数的调用过程。

封装和多态与其他语言差异不大，继承的实现上就迥异了。
`zhangsan`和`lisi`都具有人的通用属性，如果我们把人的通用属性全在`People`中定义并初始化一遍，那么每创建一个对象都要执行一遍这个过程，显然不合理。我们需要将这些属性放到原型中。

**原型（prototype）**
关于原型以及原型链见参考资料[2]。


[1] [Functions](http://www.cs.utah.edu/~germain/PPS/Topics/functions.html)
[2] [《JavaScript 闯关记》之原型及原型链](http://www.jianshu.com/p/f69d8767c066)
[3] 《单页web应用：JavaScript从前端到后端》作者：Michael Mikowski
[4] [测试支持](http://c.ranlau.com/index.php?a=main&pro_id=19)
