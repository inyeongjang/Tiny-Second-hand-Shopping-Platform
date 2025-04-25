/**
 * 템플릿 로더 유틸리티
 * HTML 템플릿을 불러오고 데이터를 바인딩하는 함수를 제공합니다.
 */

/**
 * HTML 템플릿을 로드하고 데이터를 바인딩합니다.
 * @param {string} templatePath - 템플릿 파일 경로
 * @param {Object} data - 템플릿에 바인딩할 데이터 객체
 * @returns {Promise<string>} - 데이터가 바인딩된 템플릿 내용
 */
async function loadTemplate(templatePath, data = {}) {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`템플릿을 불러오는데 실패했습니다: ${response.status}`);
    }
    
    let templateContent = await response.text();
    
    // 템플릿에 데이터 바인딩
    // {{변수명}} 패턴을 찾아 데이터 객체의 해당 속성으로 대체
    Object.keys(data).forEach(key => {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      templateContent = templateContent.replace(pattern, data[key] || '');
    });
    
    return templateContent;
  } catch (error) {
    console.error('템플릿 로드 오류:', error);
    return `<div class="alert alert-danger">템플릿 로드 실패: ${error.message}</div>`;
  }
} 