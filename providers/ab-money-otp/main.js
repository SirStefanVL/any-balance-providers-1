﻿/**
Провайдер AnyBalance (http://any-balance-providers.googlecode.com)
*/

var g_countersTable = {
	common: {
		'fio': 'info.fio'
	},
	card: {
		"balance": "cards.balance",
		"currency": "cards.currency",
		"cardnum": "cards.num",
		"__tariff": "cards.num",
		"cardname": "cards.__name",
		"till": "cards.till",
		'gracepay': 'cards.gracepay',
		'gracepaytill': 'cards.gracepay_till',
		'minpay': 'cards.minpay',
		'minpaytill': 'cards.minpay_till',
		'limit': 'cards.limit',
		'type': 'cards.type',
		'debt': 'cards.tDebt',
		'own': 'cards.own',
		'cPct': 'cards.cPct',
		'oDebt': 'cards.oDebt',
		'agreement': 'cards.agreement',
		'status': 'cards.status',
		'date_start': 'cards.date_start',
	},
	dep: {
		"balance": "deposits.balance",
		"currency": "deposits.currency",
		"pct": "deposits.pct",
		"agreement": "deposits.contract",
		"available": "deposits.available",
		"blocked": "deposits.blocked",
		"aBalance": "deposits.aBalance",
		"cardnum": "deposits.num",
		"cardname": "deposits.__name",
		"till": "deposits.till",
		"__tariff": "deposits.num",
  },
  acc: {
    "balance": "accounts.balance",
    "currency": "accounts.currency",
    'date_start': 'accounts.date_start',
    "__tariff": "accounts.num",
    "blocked": "accounts.blocked",
  }
};

function shouldProcess(counter, info){
	var prefs = AnyBalance.getPreferences();

	if(!info || (!info.__id || !info.__name))
		return false;

	switch(counter){
		case 'cards':
		{
			if(prefs.type != 'card')
				return false;
		    if(!prefs.num)
		    	return true;

			if(endsWith(info.num, prefs.num))
				return true;

			return false;
		}
		case 'accounts':
		{
			if(prefs.type != 'acc')
				return false;
		    if(!prefs.num)
		    	return true;

			if(endsWith(info.num, prefs.num))
				return true;
		}
		case 'credits':
		{
			if(prefs.type != 'crd')
				return false;
		    if(!prefs.num)
		    	return true;

			if(endsWith(info.num, prefs.num))
				return true;
		}
		case 'deposits':
		{
			if(prefs.type != 'dep')
				return false;
		    if(!prefs.num)
		    	return true;

			if(endsWith(info.num, prefs.num))
				return true;
		}
		default:
			return false;
	}
}

function main() {
    var prefs = AnyBalance.getPreferences();

    if(!/^(card|crd|dep|acc)$/i.test(prefs.type || ''))
    	prefs.type = 'card';

    var adapter = new NAdapter(joinObjects(g_countersTable[prefs.type], g_countersTable.common), shouldProcess);

    adapter.processCards = adapter.envelope(processCards);
    adapter.processAccounts = adapter.envelope(processAccounts);
    adapter.processCredits = adapter.envelope(processCredits);
    adapter.processDeposits = adapter.envelope(processDeposits);
    adapter.processInfo = adapter.envelope(processInfo);

    var html = login(prefs);

    var result = {success: true};

    adapter.processInfo(html, result);

    if(prefs.type == 'card') {
        adapter.processCards(html, result);

    if(!adapter.wasProcessed('cards'))
        throw new AnyBalance.Error(prefs.num ? 'Не найдена карта с последними цифрами ' + prefs.num : 'У вас нет ни одной карты!');

        result = adapter.convert(result);
    } else if(prefs.type == 'acc') {
        adapter.processAccounts(html, result);

        if(!adapter.wasProcessed('accounts'))
            throw new AnyBalance.Error(prefs.num ? 'Не найден счет с последними цифрами ' + prefs.num : 'У вас нет ни одного счета!');

        result = adapter.convert(result);
    } else if(prefs.type == 'crd') {
        adapter.processCredits(html, result);

        if(!adapter.wasProcessed('credits'))
            throw new AnyBalance.Error(prefs.num ? 'Не найден кредит с последними цифрами ' + prefs.num : 'У вас нет ни одного кредита!');

        result = adapter.convert(result);
    } else if(prefs.type == 'dep') {
        adapter.processDeposits(html, result);

        if(!adapter.wasProcessed('deposits'))
            throw new AnyBalance.Error(prefs.num ? 'Не найден депозит с последними цифрами ' + prefs.num : 'У вас нет ни одного депозита!');

        result = adapter.convert(result);
    }

    AnyBalance.setResult(result);
}
