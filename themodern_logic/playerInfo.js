//player info

/**
 * @class playerInfo
 * @param playerId
 * @param playerLevel
 * @param playerCash
 * @param playerBank
 * @param playerExp
 * @param playerSpecialCurr
 * @param playerPremiumCurr
 * @param playerHealth
 * @param playerEnergy
 * @param playerEnergyMax
 */
class playerInfo {
    constructor(playerId, player_level, player_cash, player_bank, player_experience, player_special_currency, player_premium_currency, player_health, player_energy, player_energy_max) {
        this.playerId = playerId;
        this.player_level = player_level;
        this.player_cash = player_cash;
        this.player_bank = player_bank;
        this.player_experience = player_experience;
        this.player_special_currency = player_special_currency;
        this.player_premium_currency = player_premium_currency;
        this.player_health = player_health;
        this.player_energy = player_energy;
        this.player_energy_max = player_energy_max;
    }

    getPlayerInfo() {
        return {
            playerId: this.playerId,
            player_level: this.player_level,
            player_cash: this.player_cash,
            player_bank: this.player_bank,
            player_experience: this.player_experience,
            player_special_currency: this.player_special_currency,
            player_premium_currency: this.player_premium_currency,
            player_health: this.player_health,
            player_energy: this.player_energy,
            player_energy_max: this.player_energy_max,
        };
    }
}

module.exports = playerInfo;