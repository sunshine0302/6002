//*****获取购物车数据进行渲染*** */
class Cart {
    constructor() {
        //购物车列表方法
        this.list();
        //给全选按钮绑定事件
        all('.check-all')[0].addEventListener('click', this.checkAll);
        all('.check-all')[1].addEventListener('click', this.checkAll);
    }


    //***购物车列表**** */
    list () {
        //1根据登录状态获取商品的id
        //获取用户名id
        let userId = localStorage.getItem('userId');
        //声明保存购物车商品id的数量
        let cartGoodsId = '';
        //2存在则去购物车cart中获取id
        if (userId) {
            ajax.get('./server/cart.php', { fn: 'getGoodsId', userId: userId }).then(res => {
                // console.log(res)
                //取出参数
                let { data, stateCode } = JSON.parse(res);
                if (stateCode == 200) {
                    //2.1购物车为空时,返回结果(实际中可能返回一句话)
                    if (!data) return;
                    //2.2不为空
                    //将商品数量和id保存为对象
                    let cartIdNum = {};
                    //遍历data数组对象
                    // console.log(data)
                    data.forEach(ele => {
                        cartGoodsId += ele.productId + ",";
                        cartIdNum[ele.productId] = ele.num;
                    })
                    //console.log(cartIdNum) [2:"40",3:'3']
                    //根据id获取商品信息,调用函数
                    Cart.getCartGoods(cartGoodsId, cartIdNum);
                }
            })
        } else {
            //3未登录去获取数据
            let cartGoods = localStorage.getItem('carts');
            //3.1
            if (!cartGoods) return;
            cartGoods = JSON.parse(cartGoods);
            //console.log(cartGoods);{2:1,8:1}
            //3/2遍历,获取id
            for (let gId in cartGoods) {
                // console.log(gId);//2  8
                cartGoodsId += gId + ","
            }
            //根据id获取商品信息,调用函数
            Cart.getCartGoods(cartGoodsId);
        }

    }
    ///*******根据购物车id,去商品表获取信息 */
    static getCartGoods (gId, cartIds = '') {
        //如果是登录状态,商品数量从cartIds添加,未登录从浏览器来
        cartIds = cartIds || JSON.parse(localStorage.getItem('carts'));
        //console.log(cartIds)
        /// goodsId: gId? 商品id
        ajax.post('./server/cart.php?fn=lst', { goodsId: gId }).then(res => {
            // console.log(res)//根据id获取了所有商的信息
            //1转化数据.获取data.
            let { data, stateCode } = JSON.parse(res);
            if (stateCode == 200) {
                let str = "";
                data.forEach(ele => {
                    //取出单个商品
                    // console.log(ele);
                    str += `<tr>
          <td class="checkbox"><input class="check-one check" type="checkbox"/ onclick="Cart.goodsCheck(this)"></td>
          <td class="goods"><img src="${ele.goodsImg}" alt=""/><span>${ele.goodsName}</span></td>
          <td class="price">${ele.price}</td>
          <td class="count">
              <span class="reduce" onclick="Cart.ruduceGoodsNum(this,${ele.id})">-</span>
              <input class="count-input" type="text" value="${cartIds[ele.id]}"/>
              <span class="add" onclick="Cart.addGoodsNum(this,${ele.id})">+</span></td>
          <td class="subtotal">${(ele.price * cartIds[ele.id]).toFixed(2)}</td>
          <td class="operation"><span class="delete" onclick='Cart.delGoods(this,${ele.id})'>删除</span></td>
      </tr>`

                })
                $('tbody').innerHTML = str;
            }

        });
    }
    ///*****全选的实现 */
    checkAll () {
        // console.log(this)
        //1实现另一个全选中或者取消
        let state = this.checked;
        // console.log(state);true
        all('.check-all')[this.getAttribute('all-key')].checked = state;
        //2让所有的商品选中
        //2.1 获取单个商品的复选框
        let checkGoods = all('.check-one');
        //2.2遍历所有的商品的单选框设置状态
        checkGoods.forEach(ele => {
            ele.checked = state;
        })
        //计算价格和数量
        Cart.cpCount();

    }
    ////***单选的实现 */
    static goodsCheck (eleObj) {
        console.log(eleObj)
        let state = eleObj.checked;
        // console.log(state) //true
        //当一件商品全选取消,全选取消
        if (!state) {

            all('.check-all')[0].checked = false;
            all('.check-all')[1].checked = false;
        } else {
            //2.所有单选选上,全选选上
            let checkOne = all('.check-one');
            // console.log(checkOne)
            let len = checkOne.length;
            //2计算选中的单选框
            let checkCount = 0;
            checkOne.forEach(ele => {
                //前面为真,后面++
                ele.checked && checkCount++
            })
            //2.3单个商品选中的个数,等于len,全选就选中
            if (len == checkCount) {
                all('.check-all')[0].checked = true;
                all('.check-all')[1].checked = true;
            }
        }
        //计算价格和数量
        Cart.cpCount();

    }

    //*******商品的删除 */
    static delGoods (eleObj, gId) {
        let userId = localStorage.getItem('userId');
        //登录时,删除数据库的cart
        if (userId) {
            ajax.get('./server/cart.php', { fn: 'delete', goodsId: gId, userId: userId }).then(res => {
                // console.log(res)
            })
            //未登录时
        } else {
            //从浏览器中取出数据
            let cartGoods = JSON.parse(localStorage.getItem('carts'));
            console.log(cartGoods)//{2: 1, 8: 1}
            //删除指定的属性
            delete cartGoods[gId];
            console.log(cartGoods);
            localStorage.setItem('carts', JSON.stringify(cartGoods));

        }
        //把当前商品对应的tr删除
        //?????
        eleObj.parentNode.parentNode.remove();
        //调用
        Cart.cpCount();
    }
    //*****8价格和数量计算 */
    static cpCount () {
        //1获取页面上所有的check-one;
        let checkOne = all('.check-one');
        //保存选中的价格和数量
        let count = 0;
        let xj = 0;
        //2遍历找出选中的的
        checkOne.forEach(ele => {
            if (ele.checked) {
                //3找到当前input对应的tr
                let trObj = ele.parentNode.parentNode;
                //4 获取数量和小计
                let tmpCount = trObj.getElementsByClassName('count-input')[0].value;
                let tmpXj = trObj.getElementsByClassName('subtotal')[0].innerHTML;
                // console.log(count, xj);
                count = tmpCount - 0 + count;
                xj = tmpXj - 0 + xj;
            }
        })
        console.log(count, xj)
        //5放到页面上
        $('#selectedTotal').innerHTML = count;
        //保留两位有效数字
        $('#priceTotal').innerHTML = parseInt(xj * 100) / 100;
    }

    ///******数量减少 */
    static ruduceGoodsNum (eleObj, gId) {
        //1修改input的数量
        //console.log(eleObj)
        let inputNumObj = eleObj.nextElementSibling;
        // console.log(inputNumObj)
        inputNumObj.value = inputNumObj.value - 0 - 1;

        //2判断登录状态,修改数据库或浏览器的数量
        if (localStorage.getItem('user')) {
            Cart.updateCart(gId, inputNumObj.value);

        } else {
            Cart.updateLocal(gId, inputNumObj.value);
        }
        if (inputNumObj.value == 0) {
            alert('确定移出购物车吗?');
            // eleObj.parentNode.parentNode.remove();不太完美
            Cart.delGoods(eleObj, gId)
        }
        //实现小计的计算
        //3.1
        let priceObj = eleObj.parentNode.previousElementSibling;
        eleObj.parentNode.nextElementSibling.innerHTML = (priceObj.innerHTML * inputNumObj.value).toFixed(2);
        //计算价格和数量
        Cart.cpCount();
    }
    ///******数量增加 */
    static addGoodsNum (eleObj, gId) {
        //1修改input的数量
        //console.log(eleObj)
        let inputNumObj = eleObj.previousElementSibling;
        // console.log(inputNumObj)
        inputNumObj.value = inputNumObj.value - 0 + 1;

        //2判断登录状态,修改数据库或浏览器的数量
        if (localStorage.getItem('user')) {
            Cart.updateCart(gId, inputNumObj.value);

        } else {
            Cart.updateLocal(gId, inputNumObj.value);
        }
        //实现小计的计算
        //3.1
        let priceObj = eleObj.parentNode.previousElementSibling;
        eleObj.parentNode.nextElementSibling.innerHTML = (priceObj.innerHTML * inputNumObj.value).toFixed(2);
        //计算价格和数量
        Cart.cpCount();
    }
    //**********cart数量修改 */
    static updateCart (gId, gNum) {
        let id = localStorage.getItem('userId');
        ajax.get('./server/cart.php', { fn: 'update', goodsId: gId, goodsNum: gNum, userId: id }).then(res => {
            console.log(res)
        })
    }
    //*******浏览器数量修改 */
    static updateLocal (gId, gNum) {
        //取出并转化
        let cartGoods = JSON.parse(localStorage.getItem('carts'));
        //从新赋值
        cartGoods[gId] = gNum;
        localStorage.setItem('carts', JSON.stringify(cartGoods))
    }
}
new Cart();