class Goods {
    //构造方法,自动调用
    constructor() {
        this.list();
        //给登录按钮绑定事件
        $('#login').addEventListener('click', this.login);
        //退出
        $('#exit').addEventListener('click', this.exit);
    }

    //****实现商品列表****//
    list () {
        //1发送ajax请求
        ajax.get('./server/goods.php', { fn: 'lst' }).then(res => {
            // console.log(res)
            //结构赋值,取出里面的参数   json对象
            let { stateCode, data } = JSON.parse(res);
            //2判断状态.拿到data
            if (stateCode == 200) {
                //3循环data对象的数据,拼接追加
                let str = '';
                data.forEach(ele => {
                    // console.log(ele)
                    str += `<div class="goodsCon"><a target = "_blank" >
            <img src="${ele.goodsImg}" class="icon"><h4 class="title">${ele.goodsName}</h4>
            <div class="info">限时抢购200条</div></a><div class="priceCon">
            <span class="price">￥${ele.price}</span>
            <span class="oldPrice">￥${(ele.price * 1.2).toFixed(2)}</span>
            <div><span class="soldText">已售${ele.num}%</span>
            <span class="soldSpan"><span style="width: 87.12px;">
            </span></span></div>
            <a class="button" target="_blank" onclick="Goods.addCart(${ele.id},1)">立即抢购</a></div></div >`;

                });
                //获取节点,将数据追加
                $('.divs').innerHTML = str;
            }

        })

    }
    ///*********登录的方法 */
    login () {
        //1发送ajax请求,让后台验证用户名和密码

        //2验证成功登录,将用户名保存到浏览器
        //设置用户名
        localStorage.setItem('user', 'zs');
        //设置用户名id
        localStorage.setItem('userId', 1);

    }

    ///******退出 */
    exit () {
        //删除用户名
        localStorage.removeItem('user');
        //删除用户id
        localStorage.removeItem('userId');
    }

    //////****数据加入购物车*** */
    //id     1
    static addCart (goodsId, goodsNum) {
        ///1判断当前用户是否登陆
        if (localStorage.getItem('user')) {
            //console.log(localStorage.getItem('user'))
            //2登陆则存入数据库
            Goods.setDataBase(goodsId, goodsNum);
        } else {
            Goods.setLocal(goodsId, goodsNum)
        }

    }
    //*****存数据库的方法 */
    static setDataBase (goodsId, goodsNum) {
        //1获取当前用户id
        let userId = localStorage.getItem('userId');
        //console.log(userId)
        //2发送ajax.进行储存
        ajax.post('./server/goods.php?fn=add', { userId: userId, gId: goodsId, gNum: goodsNum }).then(res => {
            //  console.log(res);
        });
    }

    ///****存浏览器的方法 */
    static setLocal (goodsId, goodsNum) {
        //1取出local中的数据
        let carts = localStorage.getItem('carts');
        //console.log(carts)
        //2判断是否有数据,存在则判断当前商品是否存在
        if (carts) {
            //2.1转化为对象
            carts = JSON.parse(carts);
            //2.2判断商品是否存在,存在增加数量

            for (let gId in carts) {
                //判断当前添加的商品和正在循环的商品是否一致
                if (gId == goodsId) {
                    //加数量
                    goodsNum = carts[gId] - 0 + goodsNum;
                }
            }
            //2.3不存在就新增(且给数量),存在就从新给数量
            carts[goodsId] = goodsNum;

            //2.4存到local中,转化为字符串
            localStorage.setItem('carts', JSON.stringify(carts))

        } else {
            //3没有数据就新增,保存商品id和数量
            let goodsCart = { [goodsId]: goodsNum };
            //3.1转化为json字符串
            goodsCart = JSON.stringify(goodsCart);
            localStorage.setItem('carts', goodsCart)

        }

    }


}
new Goods;


