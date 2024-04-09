import ParamError from "./ParamError.js"
import InternalError from "./InternalError.js"
import TimeoutError from "./TimeoutError.js"
import AuthenticationError from "./AuthenticationError.js"
import TokenExpiredError from "./TokenExpiredError.js"
import UnsupportedError from "./UnsupportedError.js"
import InitNetworkTimeoutError from "./InitNetworkTimeoutError.js"
import InitDecoderTimeoutError from "./InitDecoderTimeoutError.js"
import InitConfigTimeoutError from "./InitConfigTimeoutError.js"
import InitEngineTimeoutError from "./InitEngineTimeoutError.js"
import InitEngineError from "./InitEngineError.js"
import ActionBlockedError from "./ActionBlockedError.js"
import PreloadCanceledError from "./PreloadCanceledError.js"
import FrequencyLimitError from "./FrequencyLimitError.js"
import UsersUpperLimitError from "./UsersUpperLimitError.js"
import RoomsUpperLimitError from "./RoomsUpperLimitError.js"
import ServerParamError from "./ServerParamError.js"
import LackOfTokenError from "./LackOfTokenError.js"
import LoginFailedError from "./LoginFailedError.js"
import VerifyServiceDownError from "./VerifyServiceDownError.js"
import CreateSessionFailedError from "./CreateSessionFailedError.js"
import RtcConnectionError from "./RtcConnectionError.js"
import DoActionFailedError from "./DoActionFailedError.js"
import StateSyncFailedError from "./StateSyncFailedError.js"
import BroadcastFailedError from "./BroadcastFailedError.js"
import DataAbnormalError from "./DataAbnormalError.js"
import GetOnVehicleError from "./GetOnVehicleError.js"
import RepeatLoginError from "./RepeatLoginError.js"
import RoomDoseNotExistError from "./RoomDoseNotExistError.js"
import TicketExpireError from "./TicketExpireError.js"
import ServerRateLimitError from "./ServerRateLimitError.js"
import DoActionBlockedError from "./DoActionBlockedError.js"
import ActionMaybeDelayError from "./ActionMaybeDelayError.js"
import ActionResponseTimeoutError from "./ActionResponseTimeoutError.js"

const CodeErrorMap = {
    1001: ParamError,
    1002: InternalError,
    1003: TimeoutError,
    1004: AuthenticationError,
    1005: TokenExpiredError,
    1006: UnsupportedError,
    1007: InitNetworkTimeoutError,
    1008: InitDecoderTimeoutError,
    1009: InitConfigTimeoutError,
    1010: InitEngineTimeoutError,
    1011: InitEngineError,
    1012: ActionBlockedError,
    1013: PreloadCanceledError,
    1014: FrequencyLimitError,
    2e3: UsersUpperLimitError,
    2001: RoomsUpperLimitError,
    2002: ServerParamError,
    2003: LackOfTokenError,
    2004: LoginFailedError,
    2005: VerifyServiceDownError,
    2006: CreateSessionFailedError,
    2008: RtcConnectionError,
    2009: DoActionFailedError,
    2010: StateSyncFailedError,
    2011: BroadcastFailedError,
    2012: DataAbnormalError,
    2015: GetOnVehicleError,
    2017: RepeatLoginError,
    2018: RoomDoseNotExistError,
    2019: TicketExpireError,
    2020: ServerRateLimitError,
    2333: DoActionBlockedError,
    2334: ActionMaybeDelayError,
    2999: ActionResponseTimeoutError
};
export default CodeErrorMap