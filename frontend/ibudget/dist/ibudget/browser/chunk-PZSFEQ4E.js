import{a as i}from"./chunk-PHYEHXVE.js";import{B as o,nb as p,v as r,y as n}from"./chunk-4MU7JTCM.js";var a=class s{constructor(e){this.http=e}apiUrl=`${i.apiUrl}/auth`;signup(e){return this.http.post(`${this.apiUrl}/signup`,e)}checkUsername(e){return this.http.get(`
      ${this.apiUrl}/check-username/${e}
    `)}checkEmail(e){return this.http.get(`${this.apiUrl}/check-email/${e}`)}verifyEmail(e){return this.http.get(`
      ${this.apiUrl}/verify-email?token=${e}
    `)}login(e){return this.http.post(`${this.apiUrl}/login`,e).pipe(r(t=>{t.success&&t.data?.token&&localStorage.setItem("iBudget_authToken",t.data.token)}))}logout(){localStorage.removeItem("iBudget_authToken")}getToken(){return localStorage.getItem("iBudget_authToken")}isLoggedIn(){return!!this.getToken()}getProfile(){let e=this.getToken();return this.http.get(`${i.apiUrl}/user/profile`,{headers:{Authorization:`Bearer ${e}`}})}forgotPassword(e){return this.http.post(`${this.apiUrl}/forgot-password`,e)}validateResetToken(e){return this.http.get(`
      ${this.apiUrl}/validate-reset-token?token=${e}
    `)}resetPassword(e){return this.http.post(`${this.apiUrl}/reset-password`,e)}changePassword(e){return this.http.post(`${this.apiUrl}/change-password`,e)}static \u0275fac=function(t){return new(t||s)(o(p))};static \u0275prov=n({token:s,factory:s.\u0275fac,providedIn:"root"})};export{a};
