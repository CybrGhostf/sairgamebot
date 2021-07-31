const baseUrl = 'https://test-console-api.herokuapp.com'

//显示加载loading
function showLoading() {
    document.getElementById("loadingDiv").style.display = "block";
    document.getElementById("oceanBody").style.width = "100%";
    document.getElementById("oceanBody").style.position = "fixed";
}

//关闭加载loading
function closeLoading() {
    document.getElementById("loadingDiv").style.display = "none";
    document.getElementById("oceanBody").removeAttribute("style")
}

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

function getSubStr(str) {
    var subStr1 = str.substr(0, 10);
    var subStr2 = str.substr(str.length - 5, 5);
    var subStr = subStr1 + "..." + subStr2;
    return subStr;
}

$(document).ready(function () {
    if ($.cookie('address') && $.cookie('publicKey')) {
        $('.g-loginBtn').hide()
        $('.unlock').hide()
        $('.address').text(getSubStr($.cookie('address')))
    } else {
        $('.a_unlock').removeAttr('href')
        if (window.location.pathname.indexOf('/index.html') == -1) {
            window.location.href = 'index.html'
        }
    }
})

$(document).on("click", ".g-loginBtn", async function () {
    if (window.vsys) {
        let publicKeyData = await getVsysRequest("publicKey")
        if (publicKeyData.result) {
            $.cookie('publicKey', publicKeyData.publicKey);
            $.cookie('address', publicKeyData.address);
            $('.g-loginBtn').hide()
            $('.address').text(getSubStr($.cookie('address')))
            window.location.reload()
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
        window.open('https://nftoctopus.medium.com/')
    }
})

