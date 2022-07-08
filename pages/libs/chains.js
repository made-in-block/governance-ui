export const CHAINS = [
    { name: 'cosmoshub', chain_id: 'cosmoshub-4', prefix: 'cosmos' },
    { name: 'juno', chain_id: 'juno-1', prefix: 'juno' },
    { name: 'osmosis', chain_id: 'osmosis-1', prefix: 'osmo' },
    { name: 'kava', chain_id: 'kava_2222-10', prefix: 'kava' },
    { name: 'agoric', chain_id: 'agoric-3', prefix: 'agoric' },
    { name: 'irisnet', chain_id: 'irishub-1', prefix: 'iaa' },
    { name: 'persistence', chain_id: 'core-1', prefix: 'persistence' },
    { name: 'evmos', chain_id: 'evmos_9001-2', prefix: 'evmos' },
    { name: 'regen', chain_id: 'regen-1', prefix: 'regen' },
  ];

export const getChainInfo = (proposal) => {
    return CHAINS.find((el) => el.name == proposal.chain_id)
}