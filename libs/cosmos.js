import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgGrant, MsgRevoke, MsgExec } from "cosmjs-types/cosmos/authz/v1beta1/tx.js";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx.js";

export const buildExecMessage = (grantee, messages) => {
  return {
    typeUrl: "/cosmos.authz.v1beta1.MsgExec",
    value: {
      grantee: grantee,
      msgs: messages
    }
  }
}

export const voteProposal = async (chain_id, rpc, voter_address, proposal_id, option) => {

    const [offlineSigner, accounts] = await connectWallet(chain_id);

    const client = await SigningStargateClient.connectWithSigner(
        rpc,
        offlineSigner
    )

    client.registry.register("/cosmos.authz.v1beta1.MsgGrant", MsgGrant);
    client.registry.register("/cosmos.authz.v1beta1.MsgRevoke", MsgRevoke);
    client.registry.register("/cosmos.authz.v1beta1.MsgExec", MsgExec);

    // Build exec message + vote message
    let message = {
        typeUrl: "/cosmos.gov.v1beta1.MsgVote",
        value: MsgVote.encode(MsgVote.fromPartial({
            proposalId: proposal_id,
            voter: voter_address,
            option: option
        })).finish()
    }

    // This will be replaced by keplr ui
    const fee = {
        amount: [{
            denom: 'uosmo',
            amount: '5000',
        }, ],
        gas: '200000',
    }

    return await client.signAndBroadcast(accounts[0].address, [buildExecMessage(accounts[0].address, [message])], fee, "")
}

export const connectWallet = async (chain_id) => {

    await window.keplr.enable(chain_id);
    const offlineSigner = window.getOfflineSigner(chain_id);
    const accounts = await offlineSigner.getAccounts();

    return [offlineSigner, accounts];
}