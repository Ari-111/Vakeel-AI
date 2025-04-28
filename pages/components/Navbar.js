import styles from '@/styles/Navbar.module.css';
import Link from 'next/link';
import Head from 'next/head';
export default function Navbar(){
    <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Istok+Web:ital,wght@0,400;0,700;1,400;1,700&family=Joan&display=swap" rel="stylesheet"></link>
    </Head>
    return(
        <div className={styles.container}>
            <div className={styles.navbar}>
                <div className={styles.navbar_left_content}>
                    <div className={styles.logo_container}>
                            <img src='/advocate.png' width={35} height={35}/>
                            <h2 className={styles.logo_container_header}>Vakeel Ai</h2>
                    </div>
                </div>
                <div className={styles.navbar_right_content}>
                        <Link href={'/SignUp'} className={styles.sign_up_button}>
                            <h2 className={styles.button_text}>Sign Up</h2>
                        </Link>  
                </div>
            </div>
        </div>
    )
}