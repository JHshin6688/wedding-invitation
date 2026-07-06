import { Map } from "./map"
import CarIcon from "../../icons/car-icon.svg?react"
import BusIcon from "../../icons/bus-icon.svg?react"
import { LazyDiv } from "../lazyDiv"
import { LOCATION, LOCATION_ADDRESS } from "../../const"

/**
 * 오시는 길 정보를 표시하는 컴포넌트입니다.
 * 지도와 대중교통, 자가용 이용 방법을 안내합니다.
 *
 * @returns {JSX.Element} 오시는 길 섹션
 */
export const Location = () => {
  return (
    <>
      {/* 지도 및 주소 섹션 */}
      <LazyDiv className="card location">
        <h2 className="english">Location</h2>
        <div className="addr">
          {LOCATION}
          <div className="detail">{LOCATION_ADDRESS}</div>
        </div>
        <Map />
      </LazyDiv>

      {/* 대중교통 및 자가용 안내 섹션 */}
      <LazyDiv className="card location">
        {/* 대중교통 안내 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <BusIcon className="transportation-icon" />
          </div>
          <div className="heading">대중교통</div>
          <div />
          <div className="content">
            * 지하철 이용시
            <br />
            지하철 3,7,9호선 <b>고속터미널역 5번 출구</b>
            <br />
            → 서래골공원 방면 신호등 건넌 후 첫 번째 건물 (반포 효성빌딩) LL층 (지하 2층)
            <br />
            → 건물 내부 엘리베이터를 이용하시거나,
            건물 좌측에 위치한 아펠가모 간판 뒤쪽에 위치한 에스컬레이터를 이용해주세요.
          </div>
          <div />
          <div className="content">
            * 버스 이용 시
            <br />
            - 간선(파랑): 405, 740
            <br />
            - 지선(초록): 5413
            <br />
            - 마을버스: 서초13, 서초21
            <br />
            <b>서울지방조달청.서울성모병원</b>에서 하차해주세요.
            <br />
            이하 위와 동일합니다.
          </div>
        </div>

        {/* 자가용 안내 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <CarIcon className="transportation-icon" />
          </div>
          <div className="heading">자가용</div>
          <div />
          <div className="content">
            네이버 지도, 카카오 네비, 티맵 등 이용
            <br />
            <b>아펠가모 반포</b> 검색
            <br />
            - 지하 3층 ~ 지하 5층 주차장 이용 가능합니다.
            <br />
            - 주차 요금은 최초 2시간은 무료, 추가 10분당 1,000원입니다.
            <br />
            - 주차장에서 예식장으로 바로 이동 가능합니다.
            <br />
            - 주차 정산은 LL층 정산기에서 가능합니다.
          </div>
          <div />
        </div>
      </LazyDiv>
    </>
  )
}
