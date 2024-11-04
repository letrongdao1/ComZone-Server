import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, OneToMany } from 'typeorm';
import { Comic } from './comics.entity';
import { Order } from './orders.entity';
import { Otp } from './otp.entity';
import { Transaction } from './transactions.entity';
import { Address } from './address.entity';
import { Follow } from './follow.entity';
import { Bid } from './bid.entity';
import { Exchange } from './exchange.entity';
import { ExchangeCompensation } from './exchange-compensation.entity';
import { SourceOfFund } from './source-of-fund.entity';
import { WalletDeposit } from './wallet-deposit.entity';
import { Deposit } from './deposit.entity';
import { UserReport } from './user-report.entity';
import { ComicsReport } from './comics-report.entity';
import { ChatRoom } from './chat-room.entity';
import { Notification } from './notification.entity';
import { SellerFeedback } from './seller-feedback.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    name: 'email',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    nullable: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: ['MEMBER', 'SELLER', 'MODERATOR', 'ADMIN'],
    default: 'MEMBER',
  })
  role: string;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    nullable: true,
  })
  phone: string;
  @Column({
    name: 'avatar',
    type: 'varchar',
    nullable: true,
  })
  avatar: string;

  @Column({
    type: 'float',
    default: 0,
  })
  balance: number;

  @Column({
    name: 'non_withdrawable_amount',
    type: 'float',
    default: 0,
  })
  nonWithdrawableAmount: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['AVAILABLE', 'BANNED'],
    default: 'AVAILABLE',
  })
  status: string;

  @Column({
    name: 'is_verified',
    type: 'boolean',
    default: false,
  })
  is_verified: boolean;

  @Column({
    name: 'last_active',
    type: 'datetime',
    nullable: true,
  })
  last_active: Date;

  @Column({
    name: 'device_id',
    type: 'varchar',
    nullable: true,
  })
  deviceId: string;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    nullable: true,
  })
  refresh_token: string;

  @OneToMany(() => Follow, (follow) => follow.user)
  followed: Follow[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Comic, (comic) => comic.sellerId)
  comics: Comic[];

  @OneToMany(() => Bid, (bid) => bid.user)
  bids: Bid[];

  @OneToMany(() => Order, (order) => order.user)
  purchased_order: Order[];

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @OneToMany(() => Exchange, (exchange) => exchange.requestUser)
  exchangeRequests: Exchange[];

  @OneToMany(() => Exchange, (exchange) => exchange.offerUser)
  exchangeOffers: Exchange[];

  @OneToMany(
    () => ExchangeCompensation,
    (exchangeCompensation) => exchangeCompensation.user,
  )
  exchangeCompensations: ExchangeCompensation[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => SourceOfFund, (sof) => sof.user)
  sourcesOfFund: SourceOfFund[];

  @OneToMany(() => WalletDeposit, (walletDeposit) => walletDeposit.user)
  walletDeposits: WalletDeposit[];

  @OneToMany(() => Deposit, (deposit) => deposit.user)
  deposits: Deposit[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => UserReport, (userReport) => userReport.user)
  userReports: UserReport[];

  @OneToMany(() => UserReport, (userReport) => userReport.reportedUser)
  reportedUserReports: UserReport[];

  @OneToMany(() => ComicsReport, (userReport) => userReport.user)
  comicsReports: ComicsReport[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.firstUser)
  firstChatRooms: ChatRoom[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.secondUser)
  secondChatRooms: ChatRoom[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => SellerFeedback, (feedback) => feedback.user)
  userSellerFeedbacks: SellerFeedback[];

  @OneToMany(() => SellerFeedback, (feedback) => feedback.seller)
  sellerFeedbacks: SellerFeedback[];
}
