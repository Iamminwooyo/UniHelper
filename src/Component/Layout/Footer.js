import { useMediaQuery } from 'react-responsive';
import { IoCall } from "react-icons/io5";
import { RiKakaoTalkFill } from "react-icons/ri";

const Footer = () => {
    const isMobile = useMediaQuery({ maxWidth: 768 });

    return(
        <footer className='footer_layout'>
            <div className="footer_block">
                <h4 style={{margin: '0 0 10px 0', color:"#78D900"}}>회사정보</h4>
                용인대학교 컴퓨터과학과
                <br />
                사업자등록번호 : 123-45-67890
                <br />
                대표 : 정민기, 서승준, 조민우
                <br />
                주소 : 경기도 용인시 처인구 용인대학로 134
                <br />
                이메일 : zomin9546@gamil.com
            </div>

            {!isMobile && (<div className='footer_vertical'/>)}

            <div className="footer_block">
                <h4 style={{margin: '0 0 10px 0', color:"#78D900"}}>고객센터</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom:'10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center'}}>
                        <IoCall className="footer_icon"/>
                        <span>010-2364-9546</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RiKakaoTalkFill className="footer_icon"/>
                        <span>zomin0731</span>
                    </div>
                </div>
                월요일 - 금요일: 오전 11:00 ~ 오후 17:00
                <br />
                토요일 - 일요일 / (공휴일): 휴무
                <br />
            </div>
        </footer>
    );
}

export default Footer;