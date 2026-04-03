module.exports = function ({ models }) {
	const Currencies = models.use('Currencies');

	async function getAll(...data) {
		let where, attributes;
		for (const i of data) {
			if (Array.isArray(i)) attributes = i;
			else if (typeof i === "object") where = i;
		}
		return (await Currencies.findAll({ where, attributes }))
			.map(e => e.get({ plain: true }));
	}

	async function getData(userID) {
		const data = await Currencies.findOne({ where: { userID } });
		return data ? data.get({ plain: true }) : false;
	}

	async function setData(userID, options = {}) {
		let data = await Currencies.findOne({ where: { userID } });

		if (!data) {
			await createData(userID, options);
			return true;
		}

		await data.update(options);
		return true;
	}

	async function delData(userID) {
		const data = await Currencies.findOne({ where: { userID } });
		if (!data) return false;
		await data.destroy();
		return true;
	}

	async function createData(userID, defaults = {}) {
		await Currencies.findOrCreate({
			where: { userID },
			defaults
		});
		return true;
	}

	async function increaseMoney(userID, money) {
		let data = await getData(userID);

		if (!data) {
			await createData(userID, { money });
			return true;
		}

		await setData(userID, { money: data.money + money });
		return true;
	}

	async function decreaseMoney(userID, money) {
		let data = await getData(userID);

		if (!data || data.money < money) return false;

		await setData(userID, { money: data.money - money });
		return true;
	}

	return {
		getAll,
		getData,
		setData,
		delData,
		createData,
		increaseMoney,
		decreaseMoney
	};
};
