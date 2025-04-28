import {useState,useEffect} from 'react';
import styles from '@/styles/Footer.module.css';
import Link from 'next/link';
export default function Footer (){
    const [websiteData,setWebsiteData] = useState({name:"",description:""});
 
    return(
        <div className={styles.footerDiv}>
             <div className={styles.footerDiv_body}> 
                <div className={styles.footerDiv_top_left}>
                        <div className={styles.left_body}>
                                <div className={styles.logo_div}>
                                    <img src='/advocate.png' className={styles.logo_image} width={50} height={50}/>
                                  
                                </div>
                               
                                {websiteData.contact && websiteData.contact.email !== null && (
                                    <div className={styles.left_bottom}>
                                        <img src='/mail.png' width={25} height={25}/>
                                        <p className={styles.left_paragraph}>{websiteData.contact.email}</p>
                                    </div>
                                )}

                                {websiteData.contact && websiteData.contact.phone !== null && (
                                    <div className={styles.left_bottom_two}>
                                        <img src='/phone.png' width={25} height={25}/>
                                        <p className={styles.left_paragraph}>{websiteData.contact.phone}</p>
                                    </div>
                                )}

                                {websiteData.contact && websiteData.contact.address !== null && (
                                    <div className={styles.left_bottom_two}>
                                        <img src='/location.png' width={25} height={25}/>
                                        <p className={styles.left_paragraph}>{websiteData.contact.address}</p>
                                    </div>
                                )}      

                                
                        </div>
                </div>
                <div className={styles.footerDiv_top_right}>
                    <div className={styles.link_list}>

                            <p  className={styles.link_header} target='on_blank'>
                                Pages
                            </p>
                            <Link href={'/Impact'} className={styles.link} target='on_blank'>
                                Impact
                            </Link>
                            <Link href={'/About'} className={styles.link} target='on_blank'>
                                About
                            </Link>
                            <Link href={'/Team'} className={styles.link} target='on_blank'>
                                Team
                            </Link>
                            {/* <Link href={'https://maps.app.goo.gl/K4ubxyUtebVNjRRi6'} className={styles.link} target='on_blank'>
                                Blogs
                            </Link> */}
                    </div>
                 
                    <div className={styles.link_list_two}>
                            {/* <Link href={'/AboutUs'} className={styles.link}>
                                About Us
                            </Link> */}

                            <p  className={styles.link_header} target='on_blank'>
                                Resources
                            </p>
                            {/* <Link href={'/ContactUs'} className={styles.link}>
                                Privacy Policy
                            </Link> */}
                            <Link href={'/Contribute'} className={styles.link}>
                                Contribute
                            </Link>
                    </div>

                    <div className={styles.link_list_two}>

                            <p  className={styles.link_header} target='on_blank'>
                                Follow
                            </p>
                            <Link href={'https://forms.gle/igj1sS3Cu1FCwd2XA'} className={styles.link} target='on_blank'>
                                LinkedIn
                            </Link>
                            {/* <Link href={'/Donate'} className={styles.link} target='on_blank'>
                                Instagram
                            </Link> */}
                            {/* <Link href={'https://forms.gle/d7MJx3s5CwGNVDVG6'} className={styles.link} target='on_blank'>
                                Team
                            </Link>
                            <Link href={'https://maps.app.goo.gl/K4ubxyUtebVNjRRi6'} className={styles.link} target='on_blank'>
                                Blogs
                            </Link> */}
                    </div>
                </div>
             
            </div> 
            <div className={styles.footerDiv_bottom}>
                <div className={styles.footerDiv_bottom_body}>
                  <img className={styles.footerDiv_copyright_image} src='/copyright.png' width={22} height={22}/>
                  <p>Copyrights 2025 Vakeel AI. All rights reserved.</p>
                </div>
                   
            </div>
            {/* <div className={styles.footerDiv_bottom}>
                <div className={styles.footerDiv_bottom_body}>
                    <div className={styles.footerDiv_bottom_left}>
                            <div>
                                <img src='/copyright2.png' width={25} height={25}/>
                            
                            </div>
                            <p className={styles.footerDiv_bottom_left_header}>{websiteData.name}, 2024</p>
                    </div>
                    <div className={styles.footerDiv_bottom_WebSeva}>
                          <p>powered by <Link href={"https://www.webseva.org"} target={'on_blank'} className={styles.WebSeva_text}>WebSeva</Link></p>
                    </div>
                    <div className={styles.footerDiv_bottom_right}>

                        <Link href={''} target='on_blank'>
                             <img src='/linkedin.png' className={styles.social_image} width={30} height={30}/>  
                        </Link>
                        <Link href={'https://www.facebook.com/bargadngo.org/'} target='on_blank'>
                            <img src='/facebook.png' className={styles.social_image} width={30} height={30}/>
                        </Link>
                            
                            <img src='/instagram.png' className={styles.social_image} width={30} height={30}/>
                            <img src='/social.png' className={styles.social_image} width={30} height={30}/>
                            
                    </div>
                </div>
            </div> */}
        </div>
    )
}