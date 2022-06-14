
declare let window: any;
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ethers } from 'ethers';
import { BankABI } from "../Credentials/BankABI"
import { TokenABI } from "../Credentials/TokenABI"
import { environments } from "../Credentials/address";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  window: any
  public depositForm: FormGroup;
  public withDrawForm: FormGroup;

  public signer: any
  public bankContract: any
  public tokenContract: any

  public userTotalAsset: any
  public userTotalToken: any

  public totalAssest: any
  public sighnerAddress: any

  connected: boolean = false;



  constructor() {
    this.depositForm = new FormGroup({
      Deposite: new FormControl('')
    })
    this.withDrawForm = new FormGroup({
      Withdraw: new FormControl('')
    })

  }




  async ngOnInit() {

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    await provider.send("eth_requestAccounts", [])

    provider.on("network", (newNetwork: any, oldNetwork: any) => {
      if (oldNetwork) {
        window.location.reload();
      }
    })



    this.signer = provider.getSigner();
    if (await this.signer.getChainId() !== 4) {
      alert("Please change your network to rinkeby test net!")
    }
    if (await this.signer.getChainId() == 4) {
      this.connected = true
    }

    this.bankContract = new ethers.Contract(environments.bankAddress, BankABI.abi, this.signer)
    this.tokenContract = new ethers.Contract(environments.tokenAddress, TokenABI.abi, this.signer)


    this.userTotalAsset = ethers.utils.formatEther(await this.bankContract.accounts(await this.signer.getAddress()));
    this.totalAssest = ethers.utils.formatEther((await this.bankContract.total_asset()));
    this.userTotalToken = ethers.utils.formatEther((await this.tokenContract.balanceOf((await this.signer.getAddress()))));
    this.sighnerAddress = await this.signer.getAddress();


    console.log(await this.signer.getAddress())

  }


  async deposite() {
    // console.log(this.depositForm.value)
    const tx = await this.bankContract.deposit(
      { value: ethers.utils.parseEther(this.depositForm.value.Deposite.toString()) })
    console.log(tx)
    await tx.wait();
    this.depositForm.reset()
    window.location.reload()

  }

  async withDraw() {
    console.log(this.withDrawForm.value)
    const tx = await this.bankContract.withDraw(
      ethers.utils.parseEther(this.withDrawForm.value.Withdraw.toString()),
      this.tokenContract
    )
    await tx.wait();
    this.withDrawForm.reset();
    window.location.reload()
  }


}
