function setPrice() {
    let cardName = $(this).data('name')
    let nftId = $(this).data('nftid')
    let idx = $(this).data('idx')
    let price = $('.price_ipt' + idx).val()
    if (price == '') {
        alert("Price cannot be empty!")
    } else {

        $.post(
            baseUrl + "/putNftForSale",
            {
                walletAddress: $.cookie('address'),
                cardName: cardName,
                nftId: nftId,
                price: price
            },
            function (res) {

                if (res.resultCode == 1) {
                    alert('SET SUCCESS!')
                } else {
                    alert('SET FAIL!')
                }
            },
            "json"
        )
    }
}

//获取当前我的所有卡牌列表
function getMyCard() {
    $.post(
        baseUrl + "/getCardListByWallet",
        {
            name: '',
            symbol: '',
            pageIndex: 1,
            pageSize: 99999,
            walletAddress: $.cookie('address')
        },
        function (res) {
            if (res.status = '200') {
                //循环卡片数组，并添加卡片列表html,具体参数可以参照API返回数据为准
                let html = "";
                if (res.data) {

                    res.data.cards.map((item, idx) => {
                        html += '<div onclick="" class="cl_cent_middle_list_all">' +
                            '<div class="cl_cent_middle_pic">' +
                            '<img src="' + item.image + '" class="pic">' +
                            '</div>' +
                            '<div class="cl_cent_middle_cont">' +
                            '<h3 class="tit">' + item.name + '</h3>' +
                            '<div><input class="cl_hard_top_input_text price_ipt' + idx + '" type="number" placeholder="set price for sale" min="0"/></div>' +
                            '<button class="set set' + idx + '" data-name="' + item.name + ' " data-nftid="' + item.ownNFTs[0] + '" data-idx="' + idx + '">Set</button>' +
                            '</div>' +
                            '</div>'
                    })
                }
                $(".cl_gd_all").append(html);
                res.data.cards.map((item, idx) => {
                    $(document).on("click", ".set" + idx, setPrice)
                })
            }
        },
        "json"
    )
}

//获取用户当前积分数据
function getPoints() {
    $.get(
        "http://gemmer.vcoin.systems:9922/contract/balance/" + $.cookie('address') + "/" + tokenId,

        function (res) {
            if (res.status = '200') {
                $('.points').text(res.balance / res.unity)
            } else {
                $('.points').text(0)
            }
        },
        "json"
    )
}

//获取积分数据列表
function getPointsList() {
    $.get(
        baseUrl + "/wallet/getPointsList",
        {
            address: $.cookie('address'),
            public_key: $.cookie('publicKey'),
        },
        function (res) {
            if (res.status = '200') {
                //循环积分数据列表数组，并添加积分数据列表html,具体参数可以参照API返回数据为准
                let html2 = ""
                res.data.map(item => {
                    html2 += '<div class="cl_hard_top_border_item">' +
                        '<div class="cl_hard_top_list1 col-xs-3">' + item.create_time + '</div>' +
                        '<div class="cl_hard_top_list2 col-xs-6">' + item.status + '</div>' +
                        '<div class="cl_hard_top_list3 col-xs-3">' + item.points_total + '</div>' +
                        '</div>'
                })
                $(".cl_hard_top_border_all").append(html2);
            }
        },
        "json"
    )
}

async function getOCT() {
    let amountData = await getVsysRequest("tokenAmount", { tokenId: octTokenId })
    if (amountData.result) {
        $('.balance').text(amountData.amount)
        $.cookie('oct_balance', amountData.amount);
    } else {
        $('.balance').text(0)
    }
}

async function getVSYSBalance() {
    let amountData = await getVsysRequest("amount")
    if (amountData.result) {
        $('.vsys').text(amountData.amount)
    } else {
        $('.vsys').text(0)
    }
}

//获取质押数量
function getNum() {
    $.post(
        baseUrl + "/getLockList",
        {
            walletAddress: $.cookie('address'),
            pageIndex: 1,
            pageSize: 99999
        },
        function (res) {
            let lockQul = 0
            res.data.map(item => {
                if (item.type === 'DEPOSIT') {
                    lockQul += item.count
                } else {
                    lockQul -= item.count
                }
            })
            if (res.status = '200') {
                $('.qual').text(lockQul)
            } else {
                $('.qual').text(0)
            }
        },
        "json"
    )
}

$(document).ready(function () {
    //window.vsys.request({ method: "tokenAmount", params: { tokenId: 'TWufBiMfLaaaqJKu1zPR8CgyfmiYdEPUM7YCEmkyw' } }).then(res => { console.log(res) })
    setTimeout(() => {
        //获取OCT余额
        getOCT()
        //获取VSYS余额
        getVSYSBalance()
    }, 700);
    //获取质押数量
    getNum()
    //获取我的卡片数据
    getMyCard()
    //获取积分数据列表
    // getPointsList()
    //获取用户当前积分数据
    getPoints()
})
