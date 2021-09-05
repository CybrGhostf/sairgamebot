const num = [1, 2, 3, 4, 5]
let total = 0

let isDeposit = JSON.parse(window.localStorage.getItem('isDeposit'))

// Deposit contract id
let contractId = 'CCJtnJyQkgVyaxnSKkzZTWMwFFmeKxXdaXs';
// Octopus token id
let tokenId = 'TWYzPD6Gi64Det4aksEAPpwjjWgVMPFBH3fewXzQg';
let recipient = 'AR44fqiAHarRACoJsQzRVVoj4jBx5h2Qp7h';
let BuyRecipient = 'AR44fqiAHarRACoJsQzRVVoj4jBx5h2Qp7h';
let octTokenId = "TWar6LKVSYRwxkEZ3Viqa1QAZeq25w93WmHAbppbf";

//质押
async function depositToken() {
    let octBalance = $.cookie("oct_balance");
    if (octBalance < total) {
        alert("OCT is not enough!");
        return;
    }
    if (num.indexOf(Number(total)) != -1) {
        showLoading()
        //禁止多次点击
        $(document).off("click", ".cl_hard_top_btn_1", depositToken)
        let params = {
            contractId: contractId,
            publicKey: $.cookie('publicKey'),
            amount: total
        }
        let transactionData = await getVsysRequest('depositToken', params)
        if (transactionData.result) {
            if (typeof(transactionData.transactionId) == undefined) {
                alert("Deposit failed");
                return;
            }
            let data = new FormData()
            data.append('symbol', 'oct')
            data.append('walletAddress', $.cookie('address'))
            data.append('type', 'DEPOSIT')
            data.append('record', JSON.stringify(transactionData))
            data.append('number', total)

            $.ajax({
                url: baseUrl + "/saveLockConstrct",
                type: "POST",
                data: data,
                cache: false,
                processData: false,
                contentType: false,
                success: function (res) {
                    closeLoading()
                    if (res.resultCode === 0 || res.resultCode === 1) {
                        //质押成功,输入框置灰
                        $("input").attr("disabled", "disabled");
                        $("input").css("background", "lightgrey");
                        $(".cl_hard_top_btn_1").css("background", "lightgrey");
                        //状态存入localStorage
                        window.localStorage.setItem('isDeposit', true)
                        window.localStorage.setItem('total', total)
                        alert('DEPOSIT SUCCESS!')
                    } else {
                        $(document).on("click", ".cl_hard_top_btn_1", depositToken)
                        alert('DEPOSIT FAIL!')
                    }
                }
            })
        } else {
            closeLoading()
            alert('Vsys wallet plugin not logged in Or Account Changed !')
            window.localStorage.removeItem('isDeposit')
            window.localStorage.removeItem('total')
            $.removeCookie('publicKey');
            $.removeCookie('address');
            window.location.reload()
        }
    } else {
        alert('Type 1~5 !')
    }
}
//撤回质押
async function withdrawToken() {
    let isDepositCurrent = JSON.parse(window.localStorage.getItem('isDeposit'))
    let totalCurrent = JSON.parse(window.localStorage.getItem('total'))
    if (isDepositCurrent) {
        if (totalCurrent) {
            showLoading()
            //禁止多次点击
            $(document).off("click", ".cl_hard_top_btn_2", withdrawToken)
            let params = {
                contractId: contractId,
                publicKey: $.cookie('publicKey'),
                amount: totalCurrent
            }
            let transactionData = await getVsysRequest('withdrawToken', params)
            if (transactionData.result) {
                let data = new FormData()
                data.append('symbol', 'oct')
                data.append('walletAddress', $.cookie('address'))
                data.append('type', 'WITHDRAW')
                data.append('record', JSON.stringify(transactionData))
                data.append('number', totalCurrent)
                $.ajax({
                    url: baseUrl + "/saveLockConstrct",
                    type: "POST",
                    data: data,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function (res) {
                        closeLoading()
                        if (res.resultCode === 0 || res.resultCode === 1) {
                            //撤回质押成功,输入框恢复
                            alert('WITHDRAW SUCCESS!')
                            window.localStorage.setItem('isDeposit', false)
                            window.localStorage.setItem('total', 0)
                            window.location.reload()
                        } else {
                            $(document).on("click", ".cl_hard_top_btn_2", withdrawToken)
                            alert('WITHDRAW FAIL!')
                        }
                    }
                })
            } else {
                closeLoading()
                alert('Vsys wallet plugin not logged in Or Account Changed!')
                window.localStorage.removeItem('isDeposit')
                window.localStorage.removeItem('total')
                $.removeCookie('publicKey');
                $.removeCookie('address');
                window.location.reload()
            }
        } else {
            alert('Get Num Error!')
        }
    } else {
        alert('Can Not WithdrawToken! ')
    }

}

//兑换
async function Exchange() {
    showLoading()
    let id = $(this).data('id')
    let nftId = $(this).data('nftid')
    let price = $(this).data('price')
    let params = {
        tokenId: tokenId,
        publicKey: $.cookie('publicKey'),
        recipient: recipient,
        amount: price,
        description: nftId
    }
    let transactionData = await getVsysRequest('send', params)
    if (transactionData.result) {
        $.post(
            baseUrl + "/exchangeNFT",
            {
                walletAddress: $.cookie('address'),
                nftContractId: id,
                nftTokenId: nftId,
                record: JSON.stringify(transactionData)
            },
            function (res) {
                closeLoading()
                if (res.resultCode == 1) {
                    alert('EXCHANGE SUCCESS!')
                    window.location.reload()
                } else {
                    alert('EXCHANGE FAIL!')
                }
            },
            "json"
        )
    } else {
        closeLoading()
        alert('Vsys wallet plugin not logged in Or Account Changed!')
        window.localStorage.removeItem('isDeposit')
        window.localStorage.removeItem('total')
        $.removeCookie('publicKey');
        $.removeCookie('address');
        window.location.reload()
    }
}


//获取当前所有卡牌列表
function getCardLists() {
    $.post(
        baseUrl + "/getCardList",
        {
            name: '',
            symbol: '',
            pageIndex: 1,
            pageSize: 9999999
        },
        function (res) {
            if (res.status = '200') {
                //循环卡片数组，并添加卡片列表html,具体参数可以参照API返回数据为准
                let html = "";
                res.data.cards.map((item, idx) => {
                    html += '<div onclick="" class="cl_cent_middle_list_all col-md-3 col-xs-6">' +
                        '<div class="cl_cent_middle_pic">' +
                        '<img src="' + item.image + '" class="pic">' +
                        '</div>' +
                        '<div class="cl_cent_middle_cont">' +
                        '<h3 class="tit">' + item.name + '</h3>' +
                        '<ul class="item">' +
                        '<li>' +
                        '<p>CARD TYPE</p>' +
                        '<p>' + JSON.parse(item.attributes).card_type + '</p>' +
                        '</li>' +
                        '<li>' +
                        '<p>Card Total Supply</p>' +
                        '<p>' + item.nftTotal + '</p>' +
                        '</li>' +
                        '<li>' +
                        '<p>Card Inventory</p>' +
                        '<p>' + item.notSells.length + '</p>' +
                        '</li>' +
                        '<li>' +
                        '<p>Require Octopus Amount</p>' +
                        '<p>' + JSON.parse(item.attributes).price + '</p>' +
                        '</li>' +
                        '<li>' +
                        '<button class="exchange exchange' + idx + '" data-id="' + item.contractId + '" data-nftid="' + item.notSells[0] + '" data-price="' + JSON.parse(item.attributes).price + '">Exchange</button>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>'
                })
                $(".card_list").append(html);
                res.data.cards.map((item, idx) => {
                    if (item.notSells.length == 0) {
                        $(".exchange" + idx).css("background", "lightgrey")
                    } else {
                        $(document).on("click", ".exchange" + idx, Exchange)
                    }
                })
            }
        },
        "json"
    )
}

//购买
async function Buy() {
    showLoading()
    let uuid = $(this).data('uuid')
    let price = $(this).data('price')
    let params = {
        publicKey: $.cookie('publicKey'),
        recipient: BuyRecipient,
        amount: price,
        description: uuid
    }
    let transactionData = await getVsysRequest('send', params)
    if (transactionData.result) {
        $.post(
            baseUrl + "/buyNFT",
            {
                transactionUuid: uuid,
                transactionIDOnchain: transactionData.transactionId,
                buyerWalletAddress: $.cookie('address')
            },
            function (res) {
                closeLoading()
                if (res.resultCode == 1) {
                    alert('BUY SUCCESS!')
                    window.location.reload()
                } else {
                    alert('BUY FAIL!')
                }
            },
            "json"
        )
    } else {
        closeLoading()
        alert('Vsys wallet plugin not logged in Or Account Changed!')
        window.localStorage.removeItem('isDeposit')
        window.localStorage.removeItem('total')
        $.removeCookie('publicKey');
        $.removeCookie('address');
        window.location.reload()
    }
}

//获取当前所有交易卡牌列表
function getTransactionCardLists() {
    $.post(
        baseUrl + "/getTransactionList",
        {
            pageIndex: 1,
            pageSize: 9999999,
            nftCardName: ''
        },
        function (res) {
            if (res.status = '200') {
                //循环卡片数组，并添加卡片列表html,具体参数可以参照API返回数据为准
                let html = "";
                res.data.map((item, idx) => {
                    html += '<div onclick="" class="cl_cent_middle_list_all col-md-3 col-xs-6">' +
                        '<div class="cl_cent_middle_pic">' +
                        '<img src="' + item.image + '" class="pic">' +
                        '</div>' +
                        '<div class="cl_cent_middle_cont">' +
                        '<h3 class="tit">' + item.nftCardName + '</h3>' +
                        '<ul class="item">' +
                        '<li>' +
                        '<p>Nft TokenId</p>' +
                        '<p>' + getSubStr(item.nftTokenId) + '</p>' +
                        '</li>' +
                        '<li>' +
                        '<p>Owner Wallet</p>' +
                        '<p>' + getSubStr(item.sellerWalletAddress) + '</p>' +
                        '</li>' +
                        '<li>' +
                        '<p>Require VSYS Amount</p>' +
                        '<p>' + item.price + '</p>' +
                        '</li>' +
                        '<li>' +
                        '<button class="buy buy' + idx + '" data-uuid="' + item.transactionUuid + '" data-price="' + item.price + '"></button>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>'
                })
                $(".transaction_list").append(html);
                res.data.map((item, idx) => {
                    if (item.transactionStatus == 1) {
                        $('.buy').text("Buy")
                        $(document).on("click", ".buy" + idx, Buy)
                    } else {
                        $(".buy" + idx).css("background", "lightgrey")
                        $('.buy').text("Completed")
                    }
                })
            }
        },
        "json"
    )
}

$(document).on("click", ".cl_hard_top_btn_1", depositToken)

$(document).on("click", ".cl_hard_top_btn_2", withdrawToken)

$(document).ready(function () {
    $('input').keyup(function () {
        let c = $(this);
        if (num.indexOf(Number(c.val())) == -1) {
            $(this).val('')
        }
        total = c.val()
    });
    //判断是否质押
    if (isDeposit) {
        $("input").attr("disabled", "disabled");
        $("input").css("background", "lightgrey");
        $("input").val(window.localStorage.getItem('total'));
        $(".cl_hard_top_btn_1").css("background", "lightgrey");
        $(document).off("click", ".cl_hard_top_btn_1", depositToken)
    }

    //获取卡片数据
    getCardLists()
    //获取交易卡片数据
    getTransactionCardLists()
})

