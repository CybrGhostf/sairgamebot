//设置baseUrl,可自行修改
const baseUrl = 'https://api.nftoctopus.com'

//与钱包插件数据交互
function getVsysRequest(type, params) {
    return new Promise((resolve, reject) => {
        let requestData = { method: type }
        if (params) {
            requestData.params = params
        }
        window.vsys.request(requestData).then(res => {
            resolve(res)
        })
    })
}
//截取字符串中间用省略号显示
function getSubStr(str) {
    var subStr1 = str.substr(0, 10);
    var subStr2 = str.substr(str.length - 5, 5);
    var subStr = subStr1 + "..." + subStr2;
    return subStr;
}

//入口函数
$(document).ready(function () {
    //检测是否登录
    if ($.cookie('address') && $.cookie('publicKey')) {
        $('.g-loginBtn').hide()
        $('.unlock').hide()
        $('.address').text(getSubStr($.cookie('address')))
    } else {
        $('.a_unlock').removeAttr('href')
        if (window.location.pathname.indexOf('/home.html') == -1) {
            window.location.href = 'home.html'
        }
    }
})

//login
$(document).on("click", ".g-loginBtn", async function () {
    if (window.vsys) {
        //获取公钥与钱包地址
        let publicKeyData = await getVsysRequest("publicKey")
        if (publicKeyData.result) {
            $.cookie('publicKey', publicKeyData.publicKey);
            $.cookie('address', publicKeyData.address);
            $('.g-loginBtn').hide()
            $('.address').text(getSubStr($.cookie('address')))
            window.location.reload()
            //服务端登录
            $.get(
                baseUrl + "/login/send",
                {
                    address: publicKeyData.address,
                    public_key: publicKeyData.publicKey
                },
                function (res) {
                    if (res.status = '200') {
                    }
                },
                "json"
            )
        } else {
            alert('Vsys wallet plugin not logged in Or Account Changed!')
            window.localStorage.removeItem('isDeposit')
            window.localStorage.removeItem('total')
            $.removeCookie('publicKey');
            $.removeCookie('address');
            window.location.reload()
        }
    } else {
        window.open('https://www.baidu.com') //跳转链接，例如百度：https://www.baidu.com
    }
})
