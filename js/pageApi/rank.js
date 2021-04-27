//获取积分排行榜
function getMyCard() {
    $.post(
        baseUrl + "/getBonusList",
        {
            pageIndex: 1,
            pageSize: 99999
        },
        function (res) {
            if (res.status = '200') {
                //循环卡片数组，并添加卡片列表html,具体参数可以参照API返回数据为准
                let html = "";
                if (res.data) {
                    let newArr = [], tempObj = {}
                    res.data.map(item => {
                        if (!tempObj[item.walletAddress]) {
                            newArr.push(item)
                            tempObj[item.walletAddress] = item.walletAddress
                        } else {
                            let idx = newArr.findIndex(val => val.walletAddress === item.walletAddress)
                            newArr[idx].count = Number(newArr[idx].count) + Number(item.count)
                        }
                    })
                    newArr.sort((a, b) => Number(a.count) - Number(b.count)).reverse()
                    newArr.map(item => {
                        html += '<div class="content">' +
                            '<div class="walletAddress">' +
                            item.walletAddress +
                            '</div>' +
                            '<div class="balance">' +
                            item.count +
                            '</div>' +
                            '</div>'
                    })
                }
                $(".rankList").append(html);
            }
        },
        "json"
    )
}

$(document).ready(function () {
    getMyCard()
})